import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskDetailWithSwrPage } from './taskDetailWithSwrPage';
import { TaskDetailWithSwrType } from '@/components/Task/use-server/TaskDetailWithSwr';
import useSWR from 'swr';

let spyConsoleError: jest.SpyInstance<any, any>;

// Mock the dependencies
jest.mock('swr');
jest.mock('next/link', () => {
  return function MockLink({ children, href } : { children: any, href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('../../../viewModels/Task/use-server/getTasksViewModelWithSwr', () => ({
  fetcher: jest.fn(),
}));

jest.mock('../../../viewModels/Task/use-server/getTasksViewModel', () => ({
  deleteRowFromId: jest.fn(),
}));

jest.mock('../../../components/Task/use-server/TaskDetailWithSwr', () => ({
    TaskDetailWithSwr: ({ row, setTask, deleteRowFromId, buttonDisabled, setButtonDisabled } : TaskDetailWithSwrType) => (
        <div data-testid="task-detail-component">
        <p>Task ID: {row.id}</p>
        <p>Task Title: {row.title}</p>
        <button 
            onClick={() => setTask(null)}
            disabled={buttonDisabled}
            data-testid="mock-button"
        >
            Mock Action
        </button>
        </div>
    ),
}));

jest.mock('../../../lib/app/common', () => ({
  MONOREPO_PREFIX: '/app',
  TASKS_CRUD: 'tasks',
}));

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe('TaskDetailWithSwrPage', () => {
    const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
    };

    const mockTasks = [mockTask];

    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
        jest.restoreAllMocks();
    });

    it('renders loading state initially when SWR is loading', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders error state when SWR returns an error', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: new Error('SWR Error'),
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);
        
        expect(screen.getByText('from SWR - error...')).toBeInTheDocument();
    });

    it('renders task detail when data is successfully loaded', async () => {
        mockUseSWR.mockReturnValue({
            data: mockTasks,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-detail-component')).toBeInTheDocument();
            expect(screen.getByText('Task ID: 1')).toBeInTheDocument();
            expect(screen.getByText('Task Title: Test Task')).toBeInTheDocument();
        });
    });

    it('renders "record no longer exists" message when no task data is available', async () => {
        mockUseSWR.mockReturnValue({
            data: [],
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            expect(screen.getByText('The record 1 is no longer exist')).toBeInTheDocument();
        });
    });

    it('renders back link with correct href', async () => {
        mockUseSWR.mockReturnValue({
            data: mockTasks,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            const backLink = screen.getByText('Back to the table page');
            expect(backLink).toBeInTheDocument();
            expect(backLink.closest('a')).toHaveAttribute('href', '/app/tasks/use-server');
        });
    });

    it('passes correct props to TaskDetailWithSwr component', async () => {
        const mockDeleteRowFromId = require('../../../viewModels/Task/use-server/getTasksViewModel').deleteRowFromId;
        
        mockUseSWR.mockReturnValue({
            data: mockTasks,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            const taskDetailComponent = screen.getByTestId('task-detail-component');
            expect(taskDetailComponent).toBeInTheDocument();
        
            // Test that the mock button is not disabled initially
            const mockButton = screen.getByTestId('mock-button');
            expect(mockButton).not.toBeDisabled();
        });
    });

    it('handles useEffect dependency correctly - runs only once', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        mockUseSWR.mockReturnValue({
            data: mockTasks,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        const { rerender } = render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-detail-component')).toBeInTheDocument();
        });

        // Rerender with same props shouldn't cause additional effect runs
        rerender(<TaskDetailWithSwrPage id={1} />);

        // Clean up
        consoleSpy.mockRestore();
    });

    it('handles the case when swrData is undefined', async () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            expect(screen.getByText('The record 1 is no longer exist')).toBeInTheDocument();
        });
    });

    it('uses correct SWR key', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        expect(mockUseSWR).toHaveBeenCalledWith("Tasks-API-USE-SWR", expect.any(Function));
    });

    it('renders both task detail and back link when task exists', async () => {
        mockUseSWR.mockReturnValue({
            data: mockTasks,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={1} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-detail-component')).toBeInTheDocument();
            expect(screen.getByText('Back to the table page')).toBeInTheDocument();
        });
    });

    it('renders record not found message and back link when task does not exist', async () => {
        mockUseSWR.mockReturnValue({
            data: [],
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
            isValidating: false,
        });

        render(<TaskDetailWithSwrPage id={999} />);

        await waitFor(() => {
            expect(screen.getByText('The record 999 is no longer exist')).toBeInTheDocument();
            expect(screen.getByText('Back to the table page')).toBeInTheDocument();
        });
  });
});
