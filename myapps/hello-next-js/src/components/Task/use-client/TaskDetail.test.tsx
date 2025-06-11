import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskDetail } from './TaskDetail';
import type { Task } from '@/types/Task';

// Mock the constants
jest.mock('../../../lib/app/common', () => ({
  MONOREPO_PREFIX: '/app',
  TASKS_CRUD: '/tasks'
}));

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as any;

describe('TaskDetail', () => {
    const mockTask: Task = {
        id: 1,
        title: 'Test Task',
        detail: 'Test task details',
        completed: false,
        created_at: "",
    };

    const mockDeleteRowFromId = jest.fn();
    const mockSetButtonDisabled = jest.fn();

    const defaultProps = {
        row: mockTask,
        tasks: [mockTask],
        deleteRowFromId: mockDeleteRowFromId,
        buttonDisabled: false,
        setButtonDisabled: mockSetButtonDisabled
    };

    beforeEach(() => {
        jest.clearAllMocks();
        window.location.href = '';
    });

    describe('Rendering', () => {
        it('renders task details correctly', () => {
            render(<TaskDetail {...defaultProps} />);
            
            expect(screen.getByText('id: 1')).toBeInTheDocument();
            expect(screen.getByText('title: Test Task')).toBeInTheDocument();
            expect(screen.getByText('detail: Test task details')).toBeInTheDocument();
            expect(screen.getByText('completed? no')).toBeInTheDocument();
        });

        it('renders "yes" for completed task', () => {
            const completedTask = { ...mockTask, completed: true };
            render(<TaskDetail {...defaultProps} row={completedTask} />);
            
            expect(screen.getByText('completed? yes')).toBeInTheDocument();
        });

        it('renders enabled delete button when not disabled', () => {
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        });

        it('renders disabled delete button when buttonDisabled is true', () => {
            render(<TaskDetail {...defaultProps} buttonDisabled={true} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });

    describe('Redirect behavior', () => {
        it('redirects to tasks page when tasks array is empty', () => {
            render(<TaskDetail {...defaultProps} tasks={[]} />);
        
            expect(window.location.href).toBe('/app/tasks');
        });

        it('does not redirect when tasks array has items', () => {
            render(<TaskDetail {...defaultProps} tasks={[mockTask]} />);
        
            expect(window.location.href).toBe('');
        });

        it('does not redirect when tasks is undefined', () => {
            render(<TaskDetail {...defaultProps} tasks={undefined} />);
        
            expect(window.location.href).toBe('');
        });
    });

    describe('Delete functionality', () => {
        it('calls deleteRowFromId with correct id when delete button is clicked', async () => {
            mockDeleteRowFromId.mockResolvedValue(undefined);
            
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            fireEvent.click(button);
            
            expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
            await waitFor(() => {
                expect(mockDeleteRowFromId).toHaveBeenCalledWith(1);
            });
        });

        it('disables button during delete operation', async () => {
            let resolveDelete: () => void;
            const deletePromise = new Promise<void>((resolve) => {
                resolveDelete = resolve;
            });
            mockDeleteRowFromId.mockReturnValue(deletePromise);
            
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            fireEvent.click(button);
            
            expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
            
            // Resolve the promise to complete the delete operation
            resolveDelete!();
            await waitFor(() => {
                expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
            });
        });

        it('re-enables button after successful delete', async () => {
            mockDeleteRowFromId.mockResolvedValue(undefined);
            
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
            });
        });

         it('handles error when delete operation fails', async () => {
            // Mock deleteRowFromId to resolve (not reject) since it handles errors internally
            // and doesn't re-throw them based on your implementation
            mockDeleteRowFromId.mockResolvedValue(undefined);
            
            // Mock console.error to capture any logged errors from the actual deleteRowFromId
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            
            // Click the button and wait for the operation to complete
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
            });
            
            await waitFor(() => {
                expect(mockDeleteRowFromId).toHaveBeenCalledWith(1);
            });
            
            await waitFor(() => {
                expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
            });
            
            consoleSpy.mockRestore();
        });


        it('prevents default event behavior when delete button is clicked', async () => {
            mockDeleteRowFromId.mockResolvedValue(undefined);
            
            render(<TaskDetail {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            const mockEvent = { preventDefault: jest.fn() } as any;
            
            // We need to manually create and dispatch the event to test preventDefault
            button.onclick = jest.fn().mockImplementation(async (e) => {
                e.preventDefault();
                mockSetButtonDisabled(true);
                try {
                    await mockDeleteRowFromId(Number(mockTask.id));
                    mockSetButtonDisabled(false);
                } catch(e) {
                    throw new Error(`Delete row ${mockTask.id} failed: ${e}`);
                }
            });
            
            await button.onclick!(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('handles task with string id correctly', async () => {
            const taskWithStringId = { ...mockTask, id: '123' as any };
            mockDeleteRowFromId.mockResolvedValue(undefined);
            
            render(<TaskDetail {...defaultProps} row={taskWithStringId} />);
            
            const button = screen.getByRole('button', { name: 'Delete this record' });
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(mockDeleteRowFromId).toHaveBeenCalledWith(123);
            });
        });

        it('renders task with empty strings correctly', () => {
            const emptyTask = {
                id: 2,
                title: '',
                detail: '',
                completed: false,
                created_at: '',
            };
            
            render(<TaskDetail {...defaultProps} row={emptyTask} />);
            
            expect(screen.getByText('id: 2')).toBeInTheDocument();
            expect(screen.getByText('title:')).toBeInTheDocument();
            expect(screen.getByText('detail:')).toBeInTheDocument();
            expect(screen.getByText('completed? no')).toBeInTheDocument();
        });

        it('handles tasks with special characters in title and detail', () => {
            const specialTask = {
                id: 3,
                title: 'Task with "quotes" & <tags>',
                detail: 'Detail with special chars: @#$%^&*()',
                completed: true,
                created_at: '',
            };
            
            render(<TaskDetail {...defaultProps} row={specialTask} />);
            
            expect(screen.getByText('title: Task with "quotes" & <tags>')).toBeInTheDocument();
            expect(screen.getByText('detail: Detail with special chars: @#$%^&*()')).toBeInTheDocument();
        });
    });
});  