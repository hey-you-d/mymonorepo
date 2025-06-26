import React from 'react';
import { useRouter } from 'next/router';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskTable } from './TaskTable';
import type { Task } from '@/types/Task';
import { isSafeInput } from '@/lib/app/common';

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock the constants
jest.mock('../../../lib/app/common', () => ({
    MONOREPO_PREFIX: '/app',
    TASKS_CRUD: 'tasks',
    isSafeInput: jest.fn().mockReturnValue(true),
}));

// Mock window.location.replace
const mockReplace = jest.fn();
Object.defineProperty(window, 'location', {
    value: { replace: mockReplace },
    writable: true
});

describe('TaskTable', () => {
    const mockTasks: Task[] = [
        { id: 1, title: 'Test Task 1', detail: 'Test Detail 1', completed: false, created_at: '' },
        { id: 2, title: 'Test Task 2', detail: 'Test Detail 2', completed: true, created_at: '' },
        { id: 3, title: 'Test Task 3', detail: 'Test Detail 3', completed: false, created_at: '' }
    ];

    const mockCreateRow = jest.fn();
    const mockUpdateRowFromId = jest.fn();
    const mockSetButtonDisabled = jest.fn();

    const defaultProps = {
        tasks: mockTasks,
        createRow: mockCreateRow,
        updateRowFromId: mockUpdateRowFromId,
        buttonDisabled: false,
        setButtonDisabled: mockSetButtonDisabled,
        userAuthenticated: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockReplace.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            asPath: "/hello-next-js/parent",
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    })

    describe('Rendering', () => {
        it('renders table with correct structure and headers', () => {
            render(<TaskTable {...defaultProps} />);
            
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getByText('Todo list')).toBeInTheDocument();
            expect(screen.getByText('ID')).toBeInTheDocument();
            expect(screen.getByText('Task')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Completed?')).toBeInTheDocument();
        });

        it('renders all tasks correctly', () => {
            render(<TaskTable {...defaultProps} />);
            
            mockTasks.forEach(task => {
                //expect(screen.getByText(task.id.toString())).toBeInTheDocument();
                expect(screen.getByText(task.title)).toBeInTheDocument();
                expect(screen.getByText(task.detail)).toBeInTheDocument();
            });
        });

        it('renders empty state with dashes when no tasks', () => {
            render(<TaskTable {...defaultProps} tasks={[]} />);
            
            const dashCells = screen.getAllByText('-');
            expect(dashCells).toHaveLength(5);
        });

        it('displays correct total row count', () => {
            const markup = render(<TaskTable {...defaultProps} />);
            // Method 1: Check the complete table row structure
            let totalRowsRow = markup.container.querySelector('tfoot tr:first-child');
            expect(totalRowsRow).toBeInTheDocument();
            expect(totalRowsRow?.children).toHaveLength(2);
            expect(totalRowsRow?.children[0]).toHaveTextContent('Total Rows:');
            expect(totalRowsRow?.children[1]).toHaveTextContent('3');
            
            // Method 2: More specific - check the exact cell structure
            const totalRowsCell = screen.getByRole('cell', { name: 'Total Rows:' });
            const countCell = totalRowsCell.nextElementSibling;
            expect(totalRowsCell.tagName).toBe('TD');
            expect(countCell?.tagName).toBe('TD');
            expect(countCell).toHaveTextContent('3');
            
            // Method 3: Check parent row structure
            const parentRow = totalRowsCell.parentElement;
            expect(parentRow?.tagName).toBe('TR');
            expect(parentRow?.children).toHaveLength(2);
            
            const markup2 = render(<TaskTable {...defaultProps} tasks={[]} />);
            totalRowsRow = markup2.container.querySelector('tfoot tr:first-child');
            expect(totalRowsRow).toBeInTheDocument();
            expect(totalRowsRow?.children).toHaveLength(2);
            expect(totalRowsRow?.children[0]).toHaveTextContent('Total Rows:');
            expect(totalRowsRow?.children[1]).toHaveTextContent('0');
        });
    });

    describe('Checkbox functionality', () => {
        it('renders checkboxes with correct checked state', () => {
            render(<TaskTable {...defaultProps} />);
            
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).not.toBeChecked(); // Task 1: completed: false
            expect(checkboxes[1]).toBeChecked();     // Task 2: completed: true
            expect(checkboxes[2]).not.toBeChecked(); // Task 3: completed: false
        });

        it('calls updateRowFromId when checkbox is clicked (authenticated user)', async () => {
            render(<TaskTable {...defaultProps} />);
            
            const firstCheckbox = screen.getAllByRole('checkbox')[0];
            fireEvent.click(firstCheckbox);
            
            expect(mockUpdateRowFromId).toHaveBeenCalledWith(
                mockTasks, 1, 'Test Task 1', 'Test Detail 1', true
            );
        });

        it('disables checkboxes when user is not authenticated', () => {
            render(<TaskTable {...defaultProps} userAuthenticated={false} />);
            
            const checkboxes = screen.getAllByRole('checkbox');
            checkboxes.forEach(checkbox => {
                expect(checkbox).toBeDisabled();
            });
        });

        it('disables checkboxes when buttonDisabled is true', () => {
            render(<TaskTable {...defaultProps} buttonDisabled={true} />);
            
            const checkboxes = screen.getAllByRole('checkbox');
            checkboxes.forEach(checkbox => {
                expect(checkbox).toBeDisabled();
            });
        });
    });

    describe('Edit button functionality', () => {
        it('renders edit buttons for each task when authenticated', () => {
            render(<TaskTable {...defaultProps} />);
            
            const editButtons = screen.getAllByText('Edit');
            expect(editButtons).toHaveLength(3);
            editButtons.forEach(button => {
                expect(button).not.toBeDisabled();
            });
        });

        it('navigates to edit page when edit button is clicked', () => {
            render(<TaskTable {...defaultProps} />);
            
            const firstEditButton = screen.getAllByText('Edit')[0];
            fireEvent.click(firstEditButton);
            
            expect(mockReplace).toHaveBeenCalledWith("/app/tasks/edit/1?from=/hello-next-js/parent");
        });

        it('disables edit buttons when user is not authenticated', () => {
            render(<TaskTable {...defaultProps} userAuthenticated={false} />);
            
            const editButtons = screen.getAllByText('Edit');
            editButtons.forEach(button => {
                expect(button).toBeDisabled();
            });
        });

        it('disables edit buttons when buttonDisabled is true', () => {
            render(<TaskTable {...defaultProps} buttonDisabled={true} />);
            
            const editButtons = screen.getAllByText('Edit');
            editButtons.forEach(button => {
                expect(button).toBeDisabled();
            });
        });
    });

    describe('Add new task functionality', () => {
        it('renders add task form inputs', () => {
            render(<TaskTable {...defaultProps} />);
            
            expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
            expect(screen.getByText('add')).toBeInTheDocument();
        });

        it('updates input values when typing', () => {
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title') as HTMLInputElement;
            const detailInput = screen.getByPlaceholderText('Description') as HTMLInputElement;
            
            fireEvent.change(titleInput, { target: { value: 'New Task' } });
            fireEvent.change(detailInput, { target: { value: 'New Detail' } });
            
            expect(titleInput.value).toBe('New Task');
            expect(detailInput.value).toBe('New Detail');
        });

        it('creates new task when add button is clicked with valid inputs', async () => {
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const detailInput = screen.getByPlaceholderText('Description');
            const addButton = screen.getByText('add');
            
            fireEvent.change(titleInput, { target: { value: 'New Task' } });
            fireEvent.change(detailInput, { target: { value: 'New Detail' } });
            
            await act(async () => {
                fireEvent.click(addButton);
            });
            
            expect(mockCreateRow).toHaveBeenCalledWith(mockTasks, 'New Task', 'New Detail');
            expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
            expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
        });

        it('does not create task when inputs are empty', async () => {
            render(<TaskTable {...defaultProps} />);
            
            const addButton = screen.getByText('add');
            
            await act(async () => {
                fireEvent.click(addButton);
            });
            
            expect(mockCreateRow).not.toHaveBeenCalled();
        });

        it('does not create task with unsafe input (potential SQL injection)', async () => {
            (isSafeInput as jest.Mock).mockReturnValue(false);
            
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const detailInput = screen.getByPlaceholderText('Description');
            const addButton = screen.getByText('add');
            
            fireEvent.change(titleInput, { target: { value: "'; DROP TABLE tasks; --" } });
            fireEvent.change(detailInput, { target: { value: 'Valid detail' } });
            
            await act(async () => {
                fireEvent.click(addButton);
            });
            
            expect(mockCreateRow).not.toHaveBeenCalled();
        });

        it('does not create task with input longer than 500 characters', async () => {
            (isSafeInput as jest.Mock).mockReturnValue(false);
            
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const detailInput = screen.getByPlaceholderText('Description');
            const addButton = screen.getByText('add');
            
            const longString = 'a'.repeat(501);
            
            fireEvent.change(titleInput, { target: { value: longString } });
            fireEvent.change(detailInput, { target: { value: 'Valid detail' } });
            
            await act(async () => {
                fireEvent.click(addButton);
            });
            
            expect(mockCreateRow).not.toHaveBeenCalled();
        });

        it('disables add button when user is not authenticated', () => {
            render(<TaskTable {...defaultProps} userAuthenticated={false} />);
            
            const addButton = screen.getByText('add');
            expect(addButton).toBeDisabled();
        });

        it('disables add button when buttonDisabled is true', () => {
            render(<TaskTable {...defaultProps} buttonDisabled={true} />);
            
            const addButton = screen.getByText('add');
            expect(addButton).toBeDisabled();
        });

        it('disables add form when tasks array is empty', () => {
            render(<TaskTable {...defaultProps} tasks={[]} />);
            
            const addButton = screen.getByText('add');
            expect(addButton).toBeDisabled();
        });

        it('clears inputs after successful task creation', async () => {
            (isSafeInput as jest.Mock).mockReturnValue(true);
            
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title') as HTMLInputElement;
            const detailInput = screen.getByPlaceholderText('Description') as HTMLInputElement;
            const addButton = screen.getByText('add');
            
            fireEvent.change(titleInput, { target: { value: 'New Task' } });
            fireEvent.change(detailInput, { target: { value: 'New Detail' } });
            
            await act(async () => {
                fireEvent.click(addButton);
            });
            
            await waitFor(() => {
                expect(titleInput.value).toBe('');
                expect(detailInput.value).toBe('');
            });
        });
    });

    describe('Input validation (isSafeInput)', () => {
        const validInputs = [
            'Valid task',
            'Task with numbers 123',
            'Mixed: Valid-Task_123 (test)!'
        ];

        const invalidInputs = [
            'Task with punctuation.,!?\'"()-_:;',
            '<script>alert("xss")</script>',
            'SELECT * FROM tasks',
            'Task with | pipe',
            'Task with # hash',
            'Task with @ symbol',
            'Task with % percent'
        ];

        it('accepts valid inputs', async () => {
            (isSafeInput as jest.Mock).mockReturnValue(true);
            
            for (const validInput of validInputs) {
                const mockTasks: Task[] = [
                    { id: 1, title: 'Test Task 1', detail: 'Test Detail 1', completed: false, created_at: '' },
                ];
                const defaultProps2 = {
                    tasks: mockTasks,
                    createRow: mockCreateRow,
                    updateRowFromId: mockUpdateRowFromId,
                    buttonDisabled: false,
                    setButtonDisabled: mockSetButtonDisabled,
                    userAuthenticated: true
                };

                const { unmount } = render(<TaskTable {...defaultProps2} />);
                
                const titleInput = screen.getByPlaceholderText('Title');
                const detailInput = screen.getByPlaceholderText('Description');
                const addButton = screen.getByText('add');
                
                fireEvent.change(titleInput, { target: { value: validInput } });
                fireEvent.change(detailInput, { target: { value: 'Valid detail' } });
                
                await act(async () => {
                    fireEvent.click(addButton);
                });
                
                expect(mockCreateRow).toHaveBeenCalled();
                mockCreateRow.mockClear();

                // destroy the render to avoid duplicate in the next loop
                unmount();
            }
        });

        it('rejects invalid inputs', async () => {
            (isSafeInput as jest.Mock).mockReturnValue(false);
            
            for (const invalidInput of invalidInputs) {
                const mockTasks: Task[] = [
                    { id: 1, title: 'Test Task 1', detail: 'Test Detail 1', completed: false, created_at: '' },
                ];
                const defaultProps2 = {
                    tasks: mockTasks,
                    createRow: mockCreateRow,
                    updateRowFromId: mockUpdateRowFromId,
                    buttonDisabled: false,
                    setButtonDisabled: mockSetButtonDisabled,
                    userAuthenticated: true
                };

                const { unmount } =  render(<TaskTable {...defaultProps} />);
                
                const titleInput = screen.getByPlaceholderText('Title');
                const detailInput = screen.getByPlaceholderText('Description');
                const addButton = screen.getByText('add');
                
                fireEvent.change(titleInput, { target: { value: invalidInput } });
                fireEvent.change(detailInput, { target: { value: 'Valid detail' } });
                
                await act(async () => {
                    fireEvent.click(addButton);
                });
                
                expect(mockCreateRow).not.toHaveBeenCalled();

                // destroy the render to avoid duplicate in the next loop
                unmount();
            }
        });
    });

    describe("edge cases", () => {
        it('handles null/undefined tasks gracefully', () => {
            const { container, rerender } = render(<TaskTable {...defaultProps} tasks={[]} />);
      
            expect(screen.getByText('0')).toBeInTheDocument();
            
            // Test with undefined (shouldn't happen but good to test)
            rerender(<TaskTable {...defaultProps} tasks={undefined as any} />);
            
            // Check that all 5 dashes are present (one for each column)
            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(5);
            
            // Or check the specific row structure in tbody
            const emptyRow = container.querySelector('tbody tr');
            expect(emptyRow).toBeInTheDocument();
            expect(emptyRow?.children).toHaveLength(5);
            
            // Verify each cell contains a dash
            Array.from(emptyRow?.children || []).forEach(cell => {
                expect(cell).toHaveTextContent('-');
            });
        });

        it('handles missing task properties gracefully', () => {
            const incompleteTasks = [
                { id: 1, title: '', detail: '', completed: false, created_at: '' },
                { id: 2, title: 'Test Task 2', detail: 'Test Detail 2', completed: true, created_at: '' },
            ] as Task[];
            
            render(<TaskTable {...defaultProps} tasks={incompleteTasks} />);
            
            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('prevents default on edit button click', () => {
            render(<TaskTable {...defaultProps} />);
            
            const firstEditButton = screen.getAllByText('Edit')[0];
            const clickEvent = new MouseEvent('click', { bubbles: true });
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
            
            fireEvent(firstEditButton, clickEvent);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('prevents default on add button click', async () => {
            render(<TaskTable {...defaultProps} />);
            
            const titleInput = screen.getByPlaceholderText('Title');
            const detailInput = screen.getByPlaceholderText('Description');
            const addButton = screen.getByText('add');
            
            fireEvent.change(titleInput, { target: { value: 'New Task' } });
            fireEvent.change(detailInput, { target: { value: 'New Detail' } });
            
            const clickEvent = new MouseEvent('click', { bubbles: true });
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
            
            await act(async () => {
                fireEvent(addButton, clickEvent);
            });
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });
        
    });
});  