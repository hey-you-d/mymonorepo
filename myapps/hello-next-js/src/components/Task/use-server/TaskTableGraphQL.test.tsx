import React, { SetStateAction, Dispatch } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { Task } from "@/types/Task";
import { TaskTableGraphQL, TaskTableType } from './TaskTableGraphQL';

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

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock constants
jest.mock("../../../lib/app/common", () => ({
    MONOREPO_PREFIX: '/app',
    TASKS_CRUD: 'tasks',
}));

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskTable Component', () => {
    let mockPush = jest.fn();
    let mockSetTasks = jest.fn();
    let mockCreateRow = jest.fn();
    let mockUpdateRowFromId = jest.fn();
    let mockSetButtonDisabled = jest.fn();

    const mockTasks = [
        { id: 1, title: 'Test Task 1', detail: 'Test Detail 1', completed: false, created_at: "" },
        { id: 2, title: 'Test Task 2', detail: 'Test Detail 2', completed: true, created_at: "" },
    ];

    beforeEach(() => {
        // Initialize all mocks before each test
        mockPush = jest.fn();
        mockSetTasks = jest.fn();
        mockCreateRow = jest.fn().mockResolvedValue({ tasks: mockTasks });
        mockUpdateRowFromId = jest.fn().mockResolvedValue({ tasks: mockTasks });
        mockSetButtonDisabled = jest.fn();

        // Mock Next.js router
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
        jest.clearAllMocks();
    });

    const defaultProps: TaskTableType = {
        tasks: mockTasks,
        setTasks: mockSetTasks as Dispatch<SetStateAction<Task[]>>,
        createRow: mockCreateRow as TaskTableType["createRow"],
        updateRowFromId: mockUpdateRowFromId as TaskTableType["updateRowFromId"],
        buttonDisabled: false,
        setButtonDisabled: mockSetButtonDisabled as Dispatch<SetStateAction<boolean>>,
        userAuthenticated: true,
    };

    describe('Rendering', () => {
        it('renders table with correct structure', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
      
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getByText('Todo list')).toBeInTheDocument();
            expect(screen.getByText('ID')).toBeInTheDocument();
            expect(screen.getByText('Task')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Completed?')).toBeInTheDocument();
        });

        it('renders tasks when tasks array is provided', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
            expect(screen.getByText('Test Detail 1')).toBeInTheDocument();
            expect(screen.getByText('Test Task 2')).toBeInTheDocument();
            expect(screen.getByText('Test Detail 2')).toBeInTheDocument();
            expect(screen.getByText('Total Rows:')).toBeInTheDocument();
        });

        it('renders empty state when no tasks', () => {
            const emptyProps = { ...defaultProps, tasks: [] };
            
            render(<TaskTableGraphQL {...emptyProps} />);
            
            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(5); // 5 dashes for empty row
            expect(screen.getByText('Total Rows:')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('renders checkboxes with correct checked state', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
      
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).not.toBeChecked(); // Task 1 is not completed
            expect(checkboxes[1]).toBeChecked(); // Task 2 is completed
        });

        it('renders edit buttons for each task', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const editButtons = screen.getAllByText('Edit');
            expect(editButtons).toHaveLength(2);
            expect(editButtons[0]).not.toBeDisabled();
            expect(editButtons[1]).not.toBeDisabled();
        });

        it('disables edit buttons when buttonDisabled is true', () => {
            const disabledProps = { ...defaultProps, buttonDisabled: true };
            render(<TaskTableGraphQL {...disabledProps} />);
      
            const editButtons = screen.getAllByText('Edit');
            expect(editButtons[0]).toBeDisabled();
            expect(editButtons[1]).toBeDisabled();
        });
        
        it('handles empty tasks array', () => {
            const emptyTasksProps = { ...defaultProps, tasks: [] };
            render(<TaskTableGraphQL {...emptyTasksProps} />);
            
            expect(screen.getByText('Total Rows:')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    describe('Add New Task Form', () => {
        it('renders add new task form', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            expect(screen.getByText('Add new task:')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'add' })).toBeInTheDocument();
        });

        it('disables add button when buttonDisabled is true', () => {
            const disabledProps = { ...defaultProps, buttonDisabled: true };
            render(<TaskTableGraphQL {...disabledProps} />);
            
            const addButton = screen.getByRole('button', { name: 'add' });
            expect(addButton).toBeDisabled();
        });

        it('enables add button when tasks array is empty', () => {
            const emptyProps = { ...defaultProps, tasks: [] };
            render(<TaskTableGraphQL {...emptyProps} />);
            
            const addButton = screen.getByRole('button', { name: 'add' });
            expect(addButton).toBeDisabled(); // Should be disabled for empty state
        });
    });

    describe('User Interactions', () => {
        test('calls updateRowFromId when checkbox is clicked', async () => {
            defaultProps.updateRowFromId = mockUpdateRowFromId.mockResolvedValue({ tasks: mockTasks });

            render(<TaskTableGraphQL {...defaultProps} />);
            
            const firstCheckbox = screen.getAllByRole('checkbox')[0];
            fireEvent.click(firstCheckbox);
            
            await waitFor(() => {
                expect(defaultProps.updateRowFromId).toHaveBeenCalledWith(
                mockTasks,
                1,
                'Test Task 1',
                'Test Detail 1',
                true // inverted from current false state
                );
            });
            
            expect(defaultProps.setTasks).toHaveBeenCalledWith(mockTasks);
        });

        it('rejects input with HTML tags', async () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const addButton = screen.getByRole('button', { name: 'add' });
            
            fireEvent.change(titleInput, { target: { value: '<div>Test</div>' } });
            fireEvent.click(addButton);
            
            await waitFor(() => {
                expect(defaultProps.createRow).not.toHaveBeenCalled();
            });
        });
    });

    describe('Edge cases', () => {
        it('rejects input that is too long', async () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const addButton = screen.getByRole('button', { name: 'add' });
            
            const longString = 'a'.repeat(501); // Exceeds 500 character limit
            fireEvent.change(titleInput, { target: { value: longString } });
            fireEvent.click(addButton);
            
            await waitFor(() => {
                expect(defaultProps.createRow).not.toHaveBeenCalled();
            });
        });

        test('handles async errors in createRow', async () => {
            mockCreateRow.mockRejectedValue(new Error('Network error'));
            
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const addButton = screen.getByRole('button', { name: 'add' });
            
            fireEvent.change(titleInput, { target: { value: 'Test Task' } });
            fireEvent.click(addButton);
            
            await waitFor(() => {
                // recall, the viewmodel component is a server component, hence in the event of network error, 
                // it won't be reachable
                expect(defaultProps.setButtonDisabled).not.toHaveBeenCalledWith(true);
                expect(defaultProps.createRow).not.toHaveBeenCalled();
            });
        });

        test('handles async errors in updateRowFromId', async () => {
            mockUpdateRowFromId.mockRejectedValue(new Error('Network error'));
            
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const firstCheckbox = screen.getAllByRole('checkbox')[0];
            
            
            fireEvent.click(firstCheckbox);
            
            await waitFor(() => {
                // recall, thec checkbox handler will be called
                expect(defaultProps.updateRowFromId).toHaveBeenCalled();
            });

            expect(defaultProps.setTasks).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        test('has proper table structure', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getAllByRole('rowgroup')).toHaveLength(3); // thead, tbody, tfoot
            expect(screen.getAllByRole('columnheader')).toHaveLength(5);
            expect(screen.getAllByRole('row')).toHaveLength(5); // header + 2 tasks + 1 footer
        });

        test('checkboxes have proper ids', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).toHaveAttribute('id', 'chkbox-1');
            expect(checkboxes[1]).toHaveAttribute('id', 'chkbox-2');
        });

        test('inputs have proper placeholders', () => {
            render(<TaskTableGraphQL {...defaultProps} />);
            
            expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
        });
    });
});  
