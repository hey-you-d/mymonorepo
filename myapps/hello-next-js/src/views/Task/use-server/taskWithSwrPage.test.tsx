import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskWithSwrPage } from './taskWithSwrPage';
import useSWR from 'swr';
import { strictDeepEqual } from 'fast-equals';
import { TaskSeedDBType } from '@/components/Task/use-server/TaskSeedDBWithSwr';
import { TaskTableWithSwrType } from '@/components/Task/use-server/TaskTableWithSwr';

// Mock dependencies
jest.mock('swr');
jest.mock('next/link', () => {
    return ({ children, href } : { children: any, href: string }) => <a href={href}>{children}</a>;
});
jest.mock('fast-equals', () => ({
    strictDeepEqual: jest.fn()
}));

// mock the http only auth_token cookie. 
// The presence of this cookie indicates that the user has logged in
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        get: (name: string) => {
            if (name === 'auth_token') {
                return { value: 'mocked-token' };
            }
            return undefined;
        },
    })),
}));

// Mock the viewModel functions
jest.mock('../../../viewModels/Task/use-server/getTasksViewModelWithSwr', () => ({
    fetcher: jest.fn(),
    createRow: jest.fn(),
    updateRowFromId: jest.fn(),
    deleteAllRows: jest.fn(),
    seedTasksDB: jest.fn()
}));

// Mock the components
jest.mock('../../../components/Task/use-server/TaskSeedDBWithSwr', () => ({
    TaskSeedDBWithSwr: ({ tasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled } : TaskSeedDBType) => (
        <div data-testid="task-seed-db">
        <button 
            data-testid="seed-button" 
            disabled={buttonDisabled}
            onClick={() => seedTaskDB()}
        >
            Seed DB
        </button>
        <button 
            data-testid="delete-all-button" 
            disabled={buttonDisabled}
            onClick={() => deleteAllRows()}
        >
            Delete All
        </button>
        </div>
    )
}));

jest.mock('../../../components/Task/use-server/TaskTableWithSwr', () => ({
    TaskTableWithSwr: ({ tasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled } : TaskTableWithSwrType) => (
        <div data-testid="task-table">
        <div data-testid="task-count">{tasks?.length || 0} tasks</div>
        {tasks?.map(task => (
            <div key={task.id} data-testid={`task-${task.id}`}>
            {task.detail}
            </div>
        ))}
        <button 
            data-testid="create-button" 
            disabled={buttonDisabled}
            onClick={() => createRow("new title", "new detail")}
        >
            Create Task
        </button>
        </div>
    )
}));

jest.mock('../../../lib/app/common', () => ({
    TASKS_CRUD: '/tasks-crud'
}));

describe('TaskWithSwrPage', () => {
    const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
    const mockStrictDeepEqual = strictDeepEqual as jest.MockedFunction<typeof strictDeepEqual>;

    const mockTasks = [
        { id: 1, detail: 'Complete project documentation' },
        { id: 2, detail: 'Review code changes' },
        { id: 3, detail: 'Update user interface' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockStrictDeepEqual.mockReturnValue(false);
    });

    describe('Loading States', () => {
        it('displays SWR loading state when SWR is loading', () => {
            mockUseSWR.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: true,
                mutate: jest.fn(),
                isValidating: false
            });

            render(<TaskWithSwrPage />);
        
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        test('displays error state when SWR has error', () => {
            mockUseSWR.mockReturnValue({
                data: undefined,
                error: new Error('Failed to fetch'),
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });

            render(<TaskWithSwrPage />);
            
            expect(screen.getByText('from SWR - error...')).toBeInTheDocument();
        });
    });

    describe('Data Display', () => {
        beforeEach(() => {
            mockUseSWR.mockReturnValue({
                data: mockTasks,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });
        });

        it('renders tasks when data is available', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
                expect(screen.getByTestId('task-seed-db')).toBeInTheDocument();
            });
        });

        it('displays all tasks without filter', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
                expect(screen.getByText('Review code changes')).toBeInTheDocument();
                expect(screen.getByText('Update user interface')).toBeInTheDocument();
            });
        });
    });

    describe('Filtering Functionality', () => {
        beforeEach(() => {
            mockUseSWR.mockReturnValue({
                data: mockTasks,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });
        });

        it('filters tasks based on input text', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
            });

            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            act(() => {
                fireEvent.change(filterInput, { target: { value: 'project' } });
            });

            await waitFor(() => {
                expect(screen.getByText('1 tasks')).toBeInTheDocument();
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
                expect(screen.queryByText('Review code changes')).not.toBeInTheDocument();
                expect(screen.queryByText('Update user interface')).not.toBeInTheDocument();
            });
        });

        it('filtering is case insensitive', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
            });

            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            act(() => {
                fireEvent.change(filterInput, { target: { value: 'CODE' } });
            });

            await waitFor(() => {
                expect(screen.getByText('1 tasks')).toBeInTheDocument();
                expect(screen.getByText('Review code changes')).toBeInTheDocument();
            });
        });

        it('returns all tasks when filter is cleared', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
            });

            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            // Apply filter
            act(() => {
                fireEvent.change(filterInput, { target: { value: 'project' } });
            });

            await waitFor(() => {
                expect(screen.getByText('1 tasks')).toBeInTheDocument();
            });

            // Clear filter
            act(() => {
                fireEvent.change(filterInput, { target: { value: '' } });
            });

            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
            });
        });
    });

    describe('Button State Management', () => {
        beforeEach(() => {
            mockUseSWR.mockReturnValue({
                data: mockTasks,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });
        });

        it('buttons are disabled when filtering text is present', async () => {
            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                const seedButton = screen.getByTestId('seed-button');
                const deleteButton = screen.getByTestId('delete-all-button');
                const createButton = screen.getByTestId('create-button');
                
                expect(seedButton).not.toBeDisabled();
                expect(deleteButton).not.toBeDisabled();
                expect(createButton).not.toBeDisabled();
            });

            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            act(() => {
                fireEvent.change(filterInput, { target: { value: 'project' } });
            });

            await waitFor(() => {
                const seedButton = screen.getByTestId('seed-button');
                const deleteButton = screen.getByTestId('delete-all-button');
                const createButton = screen.getByTestId('create-button');
                
                expect(seedButton).toBeDisabled();
                expect(deleteButton).toBeDisabled();
                expect(createButton).toBeDisabled();
            });
        });

        it('buttons are enabled when filter text is only whitespace', async () => {
            render(<TaskWithSwrPage />);
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            act(() => {
                fireEvent.change(filterInput, { target: { value: '   ' } });
            });

            await waitFor(() => {
                const seedButton = screen.getByTestId('seed-button');
                const deleteButton = screen.getByTestId('delete-all-button');
                const createButton = screen.getByTestId('create-button');
                
                expect(seedButton).not.toBeDisabled();
                expect(deleteButton).not.toBeDisabled();
                expect(createButton).not.toBeDisabled();
            });
        });
    });

    describe('useEffect Dependencies', () => {
        it('calls strictDeepEqual to compare tasks and swrData', async () => {
            mockUseSWR.mockReturnValue({
                data: mockTasks,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });

            render(<TaskWithSwrPage />);
            
            await waitFor(() => {
                expect(mockStrictDeepEqual).toHaveBeenCalled();
            });
        });

        it('does not fetch when strictDeepEqual returns true', async () => {
            mockStrictDeepEqual.mockReturnValue(true);
            mockUseSWR.mockReturnValue({
                data: mockTasks,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });

            render(<TaskWithSwrPage />);
            
            // Should still show loading initially, but won't fetch again
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            
            // Wait a bit to ensure the effect doesn't trigger
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Should still be loading since the effect didn't run
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Empty States', () => {
        it('renders empty fragment when no data is available', () => {
            mockUseSWR.mockReturnValue({
                data: null,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
                isValidating: false
            });

            const { container } = render(<TaskWithSwrPage />);
            
            // Should render empty fragment (no content)
            expect(container.firstChild).toBeNull();
        });
    });

    describe('SWR Integration', () => {
        test('calls useSWR with correct parameters', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
            mutate: jest.fn(),
            isValidating: false
        });

        render(<TaskWithSwrPage />);
        
        expect(mockUseSWR).toHaveBeenCalledWith("Tasks-API-USE-SWR", expect.any(Function));
        });
    });
});
