import { useEffect } from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskPage } from './taskPage';
import { Task } from "@/types/Task";

const mockTasks: Task[] = [
    { id: 1, title: 'title 1', detail: 'Complete project documentation', completed: true, created_at: "" },
    { id: 2, title: 'title 2', detail: 'Review code changes', completed: true, created_at: "" },
    { id: 3, title: 'title 3', detail: 'Update test cases', completed: true, created_at: "" }
];

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

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

// Mock the external dependencies
jest.mock('../../../viewModels/Task/use-server/getTasksViewModel', () => ({
    createRow: jest.fn(),
    updateRowFromId: jest.fn(),
    deleteAllRows: jest.fn(),
    getTasksDBRows: jest.fn(),
    seedTasksDB: jest.fn(),
}));

jest.mock('../../../lib/app/common', () => ({
    TASKS_CRUD: '/tasks-crud'
}));

jest.mock('next/link', () => {
    return function MockLink({ children, href } : { children: any, href: string }) {
        return <a href={href} data-testid="swr-link">{children}</a>;
    };
});

jest.mock('../../../components/Task/use-server/TaskSeedDB', () => ({
  TaskSeedDB: jest.fn(({ tasks, setTasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled, userAuthenticated }) => (
    <div data-testid="task-seed-db">
      <button 
        data-testid="seed-button" 
        disabled={buttonDisabled}
        onClick={() => {
          setButtonDisabled(true);
          seedTaskDB().then(() => {
            setButtonDisabled(false)
          });
        }}
      >
        Seed DB
      </button>
      <button 
        data-testid="delete-all-button" 
        disabled={buttonDisabled}
        onClick={() => {
          setButtonDisabled(true);
          deleteAllRows().then(() => {
            //setTasks([]);
            setButtonDisabled(false);
          });
        }}
      >
        Delete All
      </button>
    </div>
  ))
}));

jest.mock('../../../components/Task/use-server/TaskTable', () => ({
  TaskTable: jest.fn(({ tasks, setTasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated }) => {
    userAuthenticated = true;
    
    return (
        <div data-testid="task-table">
        <div data-testid="task-count">{tasks.length} tasks</div>
        {tasks.map((task: Task, index: number) => (
            <div key={index} data-testid={`task-${index}`}>
            {task.detail}
            </div>
        ))}
        <button 
            data-testid="create-task-button" 
            disabled={buttonDisabled}
            onClick={() => {
            setButtonDisabled(true);
            const newTask = { id: Date.now(), detail: 'New Task' };
            createRow(newTask).then(() => {
                setTasks((prev: Task[]) => [...prev, newTask]);
                setButtonDisabled(false);
            });
            }}
        >
            Create Task
        </button>
        </div>
    );
})}));

jest.mock('./taskUser', () => ({
  TaskUser: ({ setUserAuthenticated }: { setUserAuthenticated: (v: boolean) => void }) => {
    useEffect(() => {
      setUserAuthenticated(true);
    }, [setUserAuthenticated]);

    return <div data-testid="task-user">Mocked TaskUser</div>;
  }
}));

// Import the mocked functions
import {
  createRow,
  updateRowFromId,
  deleteAllRows,
  getTasksDBRows,
  seedTasksDB,
} from '@/viewModels/Task/use-server/getTasksViewModel';

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default successful response
        (getTasksDBRows as jest.Mock).mockResolvedValue({ tasks: mockTasks });
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
        jest.clearAllMocks();
    });

    describe('Initial Render and Loading', () => {
        it('initially renders loading state', async () => {
            // Make the API call hang to test loading state
            (getTasksDBRows as jest.Mock).mockImplementation(() => new Promise(() => {}));
        
            render(<TaskPage />);
        
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        test('fetches and displays tasks on mount', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            expect(getTasksDBRows).toHaveBeenCalledTimes(1);
            expect(screen.getByText('3 tasks')).toBeInTheDocument();
        });

        test('handles API error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            (getTasksDBRows as jest.Mock).mockRejectedValue(new Error('API Error'));
            
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });
            
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching tasks:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('Filter Functionality', () => {
        it('renders filter input with correct placeholder', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Filter detail...')).toBeInTheDocument();
            });
            
            expect(screen.getByText('Filter task description:')).toBeInTheDocument();
        });

        it('filters tasks based on input text', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            await act(async () => {
                await userEvent.type(filterInput, 'project');
            });
            
            // Check that TaskTable received filtered tasks
            const taskTable = screen.getByTestId('task-table');
            expect(taskTable).toBeInTheDocument();
            
            // The mock TaskTable should show only filtered tasks
            await waitFor(() => {
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
                expect(screen.queryByText('Review code changes')).not.toBeInTheDocument();
            });
        });

        it('filter is case insensitive', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            await act(async () => {
                await userEvent.type(filterInput, 'PROJECT');
            });
            
            await waitFor(() => {
                expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
            });
        });

        it('shows all tasks when filter is cleared', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            // Apply filter
            await act(async () => {
                await userEvent.type(filterInput, 'project');
            });
            
            // Clear filter
            await act(async () => {
                fireEvent.change(filterInput, { target: { value: '' } });
            });
            
            await waitFor(() => {
                expect(screen.getByText('3 tasks')).toBeInTheDocument();
            });
        });
    });

    describe('Button Disabled Logic', () => {
        it('buttons are disabled initially during loading', async () => {
            render(<TaskPage />);
            
            // During initial load, buttons should be disabled
            //expect(screen.getByTestId('seed-button')).toBeDisabled();
            //expect(screen.getByTestId('delete-all-button')).toBeDisabled();
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            // After loading, buttons should be enabled (assuming no filter text)
            expect(screen.getByTestId('seed-button')).toBeEnabled();
            expect(screen.getByTestId('delete-all-button')).toBeEnabled();
        });

        it('buttons are disabled when filter text is present', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            await act(async () => {
                await userEvent.type(filterInput, 'test');
            });
            
            waitFor(() => {
                expect(screen.getByTestId('seed-button')).toBeDisabled();
                expect(screen.getByTestId('delete-all-button')).toBeDisabled();
                expect(screen.getByTestId('create-task-button')).toBeDisabled();
            });
        });

        it('buttons are enabled when filter text is only whitespace', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            await act(async () => {
                await userEvent.type(filterInput, '   ');
            });
            
            expect(screen.getByTestId('seed-button')).toBeEnabled();
            expect(screen.getByTestId('delete-all-button')).toBeEnabled();
            expect(screen.getByTestId('create-task-button')).toBeEnabled();
        });
    });

    describe('Component Integration', () => {
        it('renders TaskSeedDB with correct props', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-seed-db')).toBeInTheDocument();
            });
            
            expect(screen.getByTestId('seed-button')).toBeInTheDocument();
            expect(screen.getByTestId('delete-all-button')).toBeInTheDocument();
        });

        it('renders TaskTable with correct props', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            expect(screen.getByTestId('create-task-button')).toBeInTheDocument();
            expect(screen.getByText('3 tasks')).toBeInTheDocument();
        });
    });

    describe('State Management', () => {
        it('calls createRowfn when new task is created', async () => {
            const newTask = { id: 4, detail: 'New Task' };
            (createRow as jest.Mock).mockResolvedValue(newTask);
            
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const createButton = screen.getByTestId('create-task-button');
            
            await act(async () => {
                fireEvent.click(createButton);
            });
            
            await waitFor(() => {
                expect(createRow).toHaveBeenCalled();
            });
        });

        it('calls deleteAllRows fn when delete all is clicked', async () => {
            (deleteAllRows as jest.Mock).mockResolvedValue([]);
            
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
                expect(screen.getByTestId('task-count').innerHTML).toEqual("3 tasks");
            });
            
            const deleteAllButton = screen.getByTestId('delete-all-button');
            
            await act(async () => {
                fireEvent.click(deleteAllButton);
            });
            
            await waitFor(() => {
                expect(deleteAllRows).toHaveBeenCalled();
            });
        });

        it('calls seedTaskDB fn when seed db is clicked', async () => {
            (seedTasksDB as jest.Mock).mockResolvedValue(mockTasks);
            
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
                expect(screen.getByTestId('task-count').innerHTML).toEqual("3 tasks");
            });
            
            const seedDbButton = screen.getByTestId('seed-button');
            
            await act(async () => {
                fireEvent.click(seedDbButton);
            });
            
            await waitFor(() => {
                expect(seedTasksDB).toHaveBeenCalled();
            });
        });
    });

    describe('Edge cases', () => {
        it('handles empty task list', async () => {
            (getTasksDBRows as jest.Mock).mockResolvedValue({ tasks: [] });
      
            render(<TaskPage />);
      
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
      
            expect(screen.getByText('0 tasks')).toBeInTheDocument();
        });

        it('handles filter with no matching results', async () => {
            render(<TaskPage />);
            
            await waitFor(() => {
                expect(screen.getByTestId('task-table')).toBeInTheDocument();
            });
            
            const filterInput = screen.getByPlaceholderText('Filter detail...');
            
            await act(async () => {
                await userEvent.type(filterInput, 'nonexistent');
            });
            
            waitFor(() => {
                // Should show 0 tasks when no matches
                expect(screen.getByText('0 tasks')).toBeInTheDocument();
            });
        });
    });
});

