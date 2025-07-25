import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskSeedDB from './TaskSeedDB';
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

// Mock Task type for testing
const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    detail: 'Test Description',
    completed: false,
    created_at: String(new Date()),
};

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskSeedDB Component', () => {
    // Mock functions
    const mockSetTasks = jest.fn();
    const mockSeedTaskDB = jest.fn();
    const mockDeleteAllRows = jest.fn();
    const mockSetButtonDisabled = jest.fn();

    // Default props
    const defaultProps = {
        tasks: [],
        setTasks: mockSetTasks,
        seedTaskDB: mockSeedTaskDB,
        deleteAllRows: mockDeleteAllRows,
        buttonDisabled: false,
        setButtonDisabled: mockSetButtonDisabled,
        userAuthenticated: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        // Restore console.error
        spyConsoleError.mockRestore();
    });

    describe('Rendering', () => {
        it('renders the task count correctly when tasks array is empty', () => {
            render(<TaskSeedDB {...defaultProps} />);
      
            expect(screen.getByText('Currently, there are 0 rows in the Tasks table.')).toBeInTheDocument();
        });

        it('renders the task count correctly when tasks array has items', () => {
            const propsWithTasks = {
                ...defaultProps,
                tasks: [mockTask, { ...mockTask, id: 2 }],
            };
            
            render(<TaskSeedDB {...propsWithTasks} />);
            
            expect(screen.getByText('Currently, there are 2 rows in the Tasks table.')).toBeInTheDocument();
        });

        it('renders "Seed DB" button when tasks array is empty', () => {
            render(<TaskSeedDB {...defaultProps} />);
            
            expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
        });

        it('renders "Delete all rows" button when tasks array has items', () => {
            const propsWithTasks = {
                ...defaultProps,
                tasks: [mockTask],
            };
            
            render(<TaskSeedDB {...propsWithTasks} />);
            
            expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
        });

        it('renders disabled button when buttonDisabled is true', () => {
            const propsWithDisabledButton = {
                ...defaultProps,
                buttonDisabled: true,
            };
            
            render(<TaskSeedDB {...propsWithDisabledButton} />);
            
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('renders enabled button when buttonDisabled is false', () => {
            render(<TaskSeedDB {...defaultProps} />);
      
            const button = screen.getByRole('button');
            expect(button).not.toBeDisabled();
        });
    });

    describe('Button Click Interactions', () => {
        it('calls seedTaskDB when button is clicked and tasks array is empty', async () => {
            const mockSeedResult = { tasks: [mockTask] };
            mockSeedTaskDB.mockResolvedValue(mockSeedResult);
            
            render(<TaskSeedDB {...defaultProps} />);
            
            const button = screen.getByRole('button', { name: 'Seed DB' });
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(mockSeedTaskDB).toHaveBeenCalledTimes(1);
                expect(mockSetTasks).toHaveBeenCalledWith(mockSeedResult.tasks);
            });
        });

        it('calls deleteAllRows when button is clicked and tasks array has items', async () => {
            const propsWithTasks = {
                ...defaultProps,
                tasks: [mockTask],
            };
            const mockDeleteResult = { tasks: [] };
            mockDeleteAllRows.mockResolvedValue(mockDeleteResult);
            
            render(<TaskSeedDB {...propsWithTasks} />);
            
            const button = screen.getByRole('button', { name: 'Delete all rows' });
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(mockDeleteAllRows).toHaveBeenCalledTimes(1);
                expect(mockSetTasks).toHaveBeenCalledWith(mockDeleteResult.tasks);
            });
        });

        it('prevents default form submission on button click', async () => {
            const mockEvent = {
                preventDefault: jest.fn(),
            };
            mockSeedTaskDB.mockResolvedValue({ tasks: [] });
            
            render(<TaskSeedDB {...defaultProps} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button, mockEvent);
            
            await waitFor(() => {
                expect(mockSeedTaskDB).toHaveBeenCalled();
            });
        });

        it('disables and re-enables button during async operation', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            mockSeedTaskDB.mockReturnValue(promise);
            
            render(<TaskSeedDB {...defaultProps} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            // Button should be disabled immediately
            expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
            
            // Resolve the promise
            resolvePromise!({ tasks: [] });
            
            await waitFor(() => {
                expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
            });
            
            // Verify the sequence of calls
            expect(mockSetButtonDisabled).toHaveBeenCalledTimes(2);
            expect(mockSetButtonDisabled).toHaveBeenNthCalledWith(1, true);
            expect(mockSetButtonDisabled).toHaveBeenNthCalledWith(2, false);
        });

        it('does not call onClick handler when button is disabled', () => {
            const propsWithDisabledButton = {
                ...defaultProps,
                buttonDisabled: true,
            };
            
            render(<TaskSeedDB {...propsWithDisabledButton} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            expect(mockSeedTaskDB).not.toHaveBeenCalled();
            expect(mockDeleteAllRows).not.toHaveBeenCalled();
            expect(mockSetButtonDisabled).not.toHaveBeenCalled();
            expect(mockSetTasks).not.toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it('handles tasks array with exactly 0 length', () => {
            render(<TaskSeedDB {...defaultProps} />);
            
            expect(screen.getByText('Currently, there are 0 rows in the Tasks table.')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
        });

        it('handles tasks array with exactly 1 item', () => {
            const propsWithOneTask = {
                ...defaultProps,
                tasks: [mockTask],
            };
            
            render(<TaskSeedDB {...propsWithOneTask} />);
            
            expect(screen.getByText('Currently, there are 1 rows in the Tasks table.')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
        });
    });
});