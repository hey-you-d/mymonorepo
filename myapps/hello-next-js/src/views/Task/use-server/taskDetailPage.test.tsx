import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskDetailPage } from './taskDetailPage';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href } : { children: any, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

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

// Mock the view model functions
jest.mock('../../../viewModels/Task/use-server/getTasksViewModel', () => ({
    getRowFromId: jest.fn(),
    deleteRowFromId: jest.fn(),
}));

jest.mock('../../../viewModels/Task/use-server/getTasksUserViewModel', () => ({
  checkAuthTokenCookieExist: jest.fn(() => true),
}));

// Mock the TaskDetail component
jest.mock('../../../components/Task/use-server/TaskDetail', () => ({
    TaskDetail: jest.fn(({ row, setTask, deleteRowFromId, buttonDisabled, setButtonDisabled }) => (
        <div data-testid="task-detail">
            <span>Task ID: {row.id}</span>
            <span>Task Title: {row.title}</span>
            <button
                onClick={() => setButtonDisabled(true)}
                disabled={buttonDisabled}
                data-testid="mock-button"
            >
                Mock Action
            </button>
        </div>
    )),
}));

// Mock constants
jest.mock('../../../lib/app/common', () => ({
    MONOREPO_PREFIX: '/app',
    TASKS_CRUD: 'tasks',
}));

import { getRowFromId, deleteRowFromId } from '../../../viewModels/Task/use-server/getTasksViewModel';
import { checkAuthTokenCookieExist } from '../../../viewModels/Task/use-server/getTasksUserViewModel';

const mockGetRowFromId = getRowFromId as jest.MockedFunction<typeof getRowFromId>;
const mockDeleteRowFromId = deleteRowFromId as jest.MockedFunction<typeof deleteRowFromId>;

describe('TaskDetailPage', () => {
    const mockTask = {
        id: 1,
        title: 'Test Task',
        detail: 'Test Description',
        completed: false,
        created_at: String(new Date('2023-01-01'))
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue({ outcome: true });
        // Clear console.error mock to reduce noises between tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Successful Data Fetching', () => {
        it('should fetch and display task details successfully', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            render(<TaskDetailPage id={1} />);

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            
                // Check that getRowFromId was called with correct id
                expect(mockGetRowFromId).toHaveBeenCalledWith(1);
                expect(mockGetRowFromId).toHaveBeenCalledTimes(1);

                // Check that TaskDetail component is rendered with correct props
                expect(screen.getByTestId('task-detail')).toBeInTheDocument();
                expect(screen.getByText('Task ID: 1')).toBeInTheDocument();
                expect(screen.getByText('Task Title: Test Task')).toBeInTheDocument();
            });
        });

        it('should render back link with correct href', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument;
                
                const backLink = screen.getByText('Back to the table page');
                expect(backLink).toBeInTheDocument();
                expect(backLink.closest('a')).toHaveAttribute('href', '/app/tasks/use-server');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle fetch error and show error message', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockGetRowFromId.mockRejectedValue(new Error('Network error'));

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            // Check that error was logged
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch task:', expect.any(Error));

            // Check that error message is displayed
            expect(screen.getByText('The record 1 is no longer exist')).toBeInTheDocument();
            expect(screen.queryByTestId('task-detail')).not.toBeInTheDocument();
        });

        it('should show error message when task is null', async () => {
            mockGetRowFromId.mockResolvedValue({ task: null });

            render(<TaskDetailPage id={123} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('The record 123 is no longer exist')).toBeInTheDocument();
            expect(screen.queryByTestId('task-detail')).not.toBeInTheDocument();
        });
    });
    
    describe('Component Props and State Management', () => {
        it('should pass correct props to TaskDetail component', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByTestId('task-detail')).toBeInTheDocument();
            });

            // Verify TaskDetail received correct props
            const { TaskDetail } = require('../../../components/Task/use-server/TaskDetail');
            expect(TaskDetail).toHaveBeenCalledWith(
                expect.objectContaining({
                    row: mockTask,
                    setTask: expect.any(Function),
                    deleteRowFromId: mockDeleteRowFromId,
                    buttonDisabled: false,
                    setButtonDisabled: expect.any(Function),
                }), undefined
                // for reference: react context is undefined instead of {} because we mock the component with jest.fn() hence 
                // no context passed 
            );
        });

        it('should manage buttonDisabled state correctly', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByTestId('task-detail')).toBeInTheDocument();
            });

            const mockButton = screen.getByTestId('mock-button');
            expect(mockButton).not.toBeDisabled();

            // Simulate button click to trigger setButtonDisabled
            mockButton.click();

            await waitFor(() => {
                expect(mockButton).toBeDisabled();
            });
        });
    });

    describe('useEffect Dependencies', () => {
        it('should only fetch data once on mount', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            const { rerender } = render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            expect(mockGetRowFromId).toHaveBeenCalledTimes(1);

            // Rerender with same props - should not fetch again
            rerender(<TaskDetailPage id={1} />);

            // Still should be called only once
            expect(mockGetRowFromId).toHaveBeenCalledTimes(1);
        });

        it('should fetch data again when component is remounted', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            const { unmount } = render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(mockGetRowFromId).toHaveBeenCalledTimes(1);
            });

            unmount();

            // Mount again
            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(mockGetRowFromId).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Different ID Values', () => {
        it('should handle different task IDs correctly', async () => {
            const differentTask = { ...mockTask, id: 999 };
            mockGetRowFromId.mockResolvedValue({ task: differentTask });

            render(<TaskDetailPage id={999} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            expect(mockGetRowFromId).toHaveBeenCalledWith(999);
            expect(screen.getByText('Task ID: 999')).toBeInTheDocument();
        });
    });

    describe('Return Value Structure', () => {
        it('should return an array of React elements', async () => {
            mockGetRowFromId.mockResolvedValue({ task: mockTask });

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            // Both TaskDetail and back link should be present
            expect(screen.getByTestId('task-detail')).toBeInTheDocument();
            expect(screen.getByText('Back to the table page')).toBeInTheDocument();
        });

        it('should return error message and back link when task not found', async () => {
            mockGetRowFromId.mockResolvedValue({ task: null });

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.queryByText('Loading..')).not.toBeInTheDocument();
                // Both error message and back link should be present
                expect(screen.getByText('The record 1 is no longer exist')).toBeInTheDocument();
                expect(screen.getByText('Back to the table page')).toBeInTheDocument();
            });
        });
    });
});