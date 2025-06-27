import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskDetailWithSwr from './TaskDetailWithSwr';
import type { Task } from '@/types/Task';

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

// Mock the Task type if needed
const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    detail: 'This is a test task detail',
    completed: false,
    created_at: String(new Date()),
};

const mockCompletedTask: Task = {
    id: 2,
    title: 'Completed Task',
    detail: 'This is a completed task',
    completed: true,
    created_at: String(new Date()),
};

describe('TaskDetail', () => {
    const mockSetTask = jest.fn();
    const mockDeleteRowFromId = jest.fn();
    const mockSetButtonDisabled = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockDeleteRowFromId.mockResolvedValue({ tasks: [] });
    });

    const defaultProps = {
        row: mockTask,
        setTask: mockSetTask,
        deleteRowFromId: mockDeleteRowFromId,
        buttonDisabled: false,
        setButtonDisabled: mockSetButtonDisabled
    };

    it('renders task details correctly', () => {
        render(<TaskDetailWithSwr {...defaultProps} />);
        
        expect(screen.getByText('id: 1')).toBeInTheDocument();
        expect(screen.getByText('title: Test Task')).toBeInTheDocument();
        expect(screen.getByText('detail: This is a test task detail')).toBeInTheDocument();
        expect(screen.getByText('completed? no')).toBeInTheDocument();
    });

    it('renders completed task correctly', () => {
        render(<TaskDetailWithSwr {...defaultProps} row={mockCompletedTask} />);
        
        expect(screen.getByText('id: 2')).toBeInTheDocument();
        expect(screen.getByText('title: Completed Task')).toBeInTheDocument();
        expect(screen.getByText('detail: This is a completed task')).toBeInTheDocument();
        expect(screen.getByText('completed? yes')).toBeInTheDocument();
    });

    it('renders enabled delete button when buttonDisabled is false', () => {
        render(<TaskDetailWithSwr {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).not.toBeDisabled();
    });

    it('renders disabled delete button when buttonDisabled is true', () => {
        render(<TaskDetailWithSwr {...defaultProps} buttonDisabled={true} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toBeDisabled();
    });

    it('calls deleteRowFromId and updates state when delete button is clicked', async () => {
        render(<TaskDetailWithSwr {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        fireEvent.click(deleteButton);

        // Check that button is disabled during operation
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
        
        // Wait for async operation to complete
        await waitFor(() => {
        expect(mockDeleteRowFromId).toHaveBeenCalledWith(1);
        });

        // Check that task is set to null and button is re-enabled
        expect(mockSetTask).toHaveBeenCalledWith(null);
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
    });

    it('prevents default event behavior when delete button is clicked', async () => {
        render(<TaskDetailWithSwr {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        const mockEvent = { preventDefault: jest.fn() } as any;
        
        fireEvent.click(deleteButton, mockEvent);

        await waitFor(() => {
        expect(mockDeleteRowFromId).toHaveBeenCalled();
        });
    });

    it('calls deleteRowFromId and updates state when delete button is clicked', async () => {
        render(<TaskDetailWithSwr {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        fireEvent.click(deleteButton);

        // Check that button is disabled during operation
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
        
        // Wait for async operation to complete
        await waitFor(() => {
            expect(mockDeleteRowFromId).toHaveBeenCalledWith(1);
        });

        // Check that task is set to null and button is re-enabled
        expect(mockSetTask).toHaveBeenCalledWith(null);
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
    });

    it('converts row.id to number when calling deleteRowFromId', async () => {
        const taskWithStringId = { ...mockTask, id: '5' as any };
        render(<TaskDetailWithSwr {...defaultProps} row={taskWithStringId} />);
        
        const deleteButton = screen.getByRole('button', { name: 'Delete this record' });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockDeleteRowFromId).toHaveBeenCalledWith(5);
        });
    });
});
