import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskDetailPage } from './taskDetailPage';
import type { TaskDetailType } from '@/components/Task/use-client/TaskDetail';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href } : {children: any, href: string}) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the view models
jest.mock('../../../viewModels/Task/use-client/useTasksViewModelWithSwr');
jest.mock('../../../viewModels/Task/use-client/useTaskUserViewModel');

// Mock the TaskDetail component
jest.mock('../../../components/Task/use-client/TaskDetail', () => ({
  TaskDetail: ({ row, tasks, deleteRowFromId, buttonDisabled, setButtonDisabled } : TaskDetailType) => (
    <div data-testid="task-detail">
      <div>Task ID: {row.id}</div>
      <div>Task Title: {row.title}</div>
      <button 
        disabled={buttonDisabled}
        onClick={() => deleteRowFromId(row.id)}
      >
        Delete
      </button>
    </div>
  )
}));

// Mock constants
jest.mock('../../../lib/app/common', () => ({
  MONOREPO_PREFIX: '/app',
  TASKS_CRUD: 'tasks'
}));

import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import useTaskUserViewModel from '@/viewModels/Task/use-client/useTaskUserViewModel';

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskDetailPage', () => {
    const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1' },
        { id: 2, title: 'Task 2', description: 'Description 2' },
        { id: 3, title: 'Task 3', description: 'Description 3' }
    ];

    const mockDeleteRowFromId = jest.fn();
    const mockCheckAuthTokenCookieExist = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock implementations
        (useTaskViewModelWithSwr as jest.Mock).mockReturnValue({
            tasks: mockTasks,
            loading: false,
            deleteRowFromId: mockDeleteRowFromId
        });

        (useTaskUserViewModel as jest.Mock).mockReturnValue({
            checkAuthTokenCookieExist: mockCheckAuthTokenCookieExist,
        });

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        jest.restoreAllMocks();

        // Restore console.error
        spyConsoleError.mockRestore();
    });

    describe('Loading state', () => {
        it('should display loading message when loading is true', () => {
            (useTaskViewModelWithSwr as jest.Mock).mockReturnValue({
                tasks: null,
                loading: true,
                deleteRowFromId: mockDeleteRowFromId
            });

            render(<TaskDetailPage id={1} />);
            
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Authentication flow', () => {
        it('should check authentication on mount', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(mockCheckAuthTokenCookieExist).toHaveBeenCalled();
            });
        });

        it('should show TaskDetail when user is authenticated and task exists', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByTestId('task-detail')).toBeInTheDocument();
                expect(screen.getByText('Task ID: 1')).toBeInTheDocument();
                expect(screen.getByText('Task Title: Task 1')).toBeInTheDocument();
            });
        });

        it('should show login message when user is not authenticated', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(false);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByText('You must be logged-in first to edit this task')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('task-detail')).not.toBeInTheDocument();
        });
    });

    describe('Task existence', () => {
        it('should show task not found message when task does not exist but user is authenticated', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={999} />); // Non-existent task ID

            await waitFor(() => {
                expect(screen.getByText('The record 999 is no longer exist')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('task-detail')).not.toBeInTheDocument();
        });

        it('should find and display the correct task by id', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={2} />);

            await waitFor(() => {
                expect(screen.getByText('Task ID: 2')).toBeInTheDocument();
                expect(screen.getByText('Task Title: Task 2')).toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        it('should always render back link to tasks page', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                const backLink = screen.getByText('Back to the table page');
                expect(backLink).toBeInTheDocument();
                expect(backLink.closest('a')).toHaveAttribute('href', '/app/tasks');
            });
        });

        it('should render back link even when not authenticated', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(false);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                const backLink = screen.getByText('Back to the table page');
                expect(backLink).toBeInTheDocument();
                expect(backLink.closest('a')).toHaveAttribute('href', '/app/tasks');
            });
        });
    });

    describe('Props handling', () => {
        it('should pass correct props to TaskDetail component', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                const taskDetail = screen.getByTestId('task-detail');
                expect(taskDetail).toBeInTheDocument();
                
                // Check that delete button is rendered (indicating props are passed)
                const deleteButton = screen.getByText('Delete');
                expect(deleteButton).toBeInTheDocument();
                expect(deleteButton).not.toBeDisabled();
            });
        });
    });

    describe('State management', () => {
        it('should update authentication state when token status changes', async () => {
            let resolveAuthCheck: (value: unknown) => void = (x) => {};
            const authPromise = new Promise(resolve => {
                resolveAuthCheck = resolve;
            });
            
            mockCheckAuthTokenCookieExist.mockReturnValue(authPromise);

            render(<TaskDetailPage id={1} />);

            // Initially should show login message (not authenticated yet)
            expect(screen.getByText('You must be logged-in first to edit this task')).toBeInTheDocument();

            // Resolve auth check as authenticated
            resolveAuthCheck(true);

            await waitFor(() => {
                expect(screen.queryByText('You must be logged-in first to edit this task')).not.toBeInTheDocument();
                expect(screen.getByTestId('task-detail')).toBeInTheDocument();
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle empty tasks array', async () => {
            (useTaskViewModelWithSwr as jest.Mock).mockReturnValue({
                tasks: [],
                loading: false,
                deleteRowFromId: mockDeleteRowFromId
            });
            
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByText('The record 1 is no longer exist')).toBeInTheDocument();
            });
        });

        it('should handle null tasks', async () => {
            (useTaskViewModelWithSwr as jest.Mock).mockReturnValue({
                tasks: null,
                loading: false,
                deleteRowFromId: mockDeleteRowFromId
            });
            
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByText('You must be logged-in first to edit this task')).toBeInTheDocument();
            });
        });

        it('should handle authentication check failure', async () => {
            (mockCheckAuthTokenCookieExist as jest.Mock).mockRejectedValue(new Error('Auth check failed'));

            render(<TaskDetailPage id={1} />);

            await waitFor(() => {
                expect(screen.getByText('You must be logged-in first to edit this task')).toBeInTheDocument();
            });
        });
    });
});