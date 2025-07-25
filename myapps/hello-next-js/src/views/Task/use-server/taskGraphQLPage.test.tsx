import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Task } from "@/types/Task";
import { LOCALHOST_MODE, SECRET_LOCATION } from "../../../lib/app/featureFlags";

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

jest.mock("../../../lib/app/featureFlags", () => ({
    APP_ENV: "LOCAL",
    SECRET_LOCATION: "REMOTE",
    LOCALHOST_MODE: {
        apiKeyId: "/dev/tasks/bff/x-api-key",
        domain: "http://localhost:3000",
        base: {
            clientSide: "", // can be a relative url
            serverSide: "http://localhost:3000", // must be an absolute url
        },
        cookie: {
            secure: false,
            path: "/",
        },
    }
}));

// Mock the child components
jest.mock('../../../components/Task/use-server/TaskSeedDBGraphQL', () => ({
    // tells Jest that the module uses ES module syntax, which is required when mocking default exports.
    __esModule: true,
    // default: (...) => JSX replaces the memoized component safely and correctly.
    default: jest.fn(({ tasks, setTasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled }) => (
        <div 
            data-testid="task-seed-db-graphql"
            data-tasks-length={tasks.length}
            data-button-disabled={buttonDisabled}
        >
            TaskSeedDBGraphQL Component
        </div>
    ))
}));

jest.mock('../../../components/Task/use-server/TaskTableGraphQL', () => ({
    // tells Jest that the module uses ES module syntax, which is required when mocking default exports.
    __esModule: true,
    // default: (...) => JSX replaces the memoized component safely and correctly.
    default: jest.fn(({ tasks, setTasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled }) => (
        <div 
            data-testid="task-table-graphql"
            data-tasks-length={tasks.length}
            data-button-disabled={buttonDisabled}
        >
            TaskTableGraphQL Component
        </div>
    ))
}));

// Mock the API functions
jest.mock('../../../viewModels/Task/use-server/getTaskGraphQLViewModel', () => ({
  getTasksDBRows: jest.fn(),
  createRow: jest.fn(),
  updateRowFromId: jest.fn(),
  deleteAllRows: jest.fn(),
  seedTaskDB: jest.fn()
}));

// Import the mocked functions
import {
    createRow,
    updateRowFromId,
    deleteAllRows,
    getTasksDBRows,
    seedTaskDB
} from '@/viewModels/Task/use-server/getTaskGraphQLViewModel';
import { TaskGraphQLPage } from './taskGraphQLPage';
import TaskSeedDBGraphQL from '@/components/Task/use-server/TaskSeedDBGraphQL';
import TaskTableGraphQL from '@/components/Task/use-server/TaskTableGraphQL';

let spyConsoleError: jest.SpyInstance<any, any>;
let spyConsoleLog: jest.SpyInstance<any, any>;

describe('TaskGraphQLPage', () => {
  const mockTasks: Task[] = [
    { id: 1, title: 'Task 1', detail: 'Description 1', completed: false, created_at: "" },
    { id: 2, title: 'Task 2', detail: 'Description 2', completed: true, created_at: "" }
  ];

  beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
      
      // hide console.error to reduce noise on the console output
      spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
      spyConsoleLog = jest.spyOn(console, "log").mockImplementation(()=> {});
  });

  afterEach(() => {
      // Restore console.error
      spyConsoleError.mockRestore();
      spyConsoleLog.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  })

  describe('Component Rendering', () => {
      it('renders loading state initially', () => {
          // Mock getTasksDBRows to return a promise that doesn't resolve immediately
          (getTasksDBRows as jest.Mock).mockImplementation(() => new Promise(() => {}));

          render(<TaskGraphQLPage />);

          expect(screen.getByText('Loading...')).toBeInTheDocument();  
      });

      it('renders main heading', async () => {
          (getTasksDBRows as jest.Mock).mockResolvedValue([]);

          render(<TaskGraphQLPage />);

          await waitFor(() => {
              expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
          });

          expect(screen.getByText(/Data fetching & querying with Apollo Graphql/)).toBeInTheDocument();
      });

      it('renders child components after loading', async () => {
          const mockTasks = [
              { id: 1, title: 'Task 1', completed: false },
              { id: 2, title: 'Task 2', completed: true }
          ];
          (getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

          render(<TaskGraphQLPage />);

          await waitFor(() => {
              expect(screen.getByTestId('task-seed-db-graphql')).toBeInTheDocument();
          });

          expect(screen.getByTestId('task-table-graphql')).toBeInTheDocument();
      });
  });
  describe('Data Fetching', () => {
    it('calls getTasksDBRows on mount', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue([]);

        render(<TaskGraphQLPage />);

        expect(getTasksDBRows).toHaveBeenCalledTimes(1);
    });
    it('sets tasks state when data is fetched successfully', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(screen.getByTestId('task-seed-db-graphql')).toHaveAttribute('data-tasks-length', '2');
        });

        expect(screen.getByTestId('task-table-graphql')).toHaveAttribute('data-tasks-length', '2');
    });
    it('handles empty tasks array', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue([]);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(screen.getByTestId('task-seed-db-graphql')).toHaveAttribute('data-tasks-length', '0');
        });

        expect(screen.getByTestId('task-table-graphql')).toHaveAttribute('data-tasks-length', '0');
    });
    it('handles null/undefined response from getTasksDBRows', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue(null);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(screen.getByTestId('task-seed-db-graphql')).toHaveAttribute('data-tasks-length', '0');
        });

        expect(screen.getByTestId('task-table-graphql')).toHaveAttribute('data-tasks-length', '0');
    });
  });
  describe('Loading and Button States', () => {
    it('sets loading and buttonDisabled to true initially', () => {
        (getTasksDBRows as jest.Mock).mockImplementation(() => new Promise(() => {}));

        render(<TaskGraphQLPage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    it('sets buttonDisabled to false after successful fetch', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue([]);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(screen.getByTestId('task-seed-db-graphql')).toHaveAttribute('data-button-disabled', 'false');
        });

        expect(screen.getByTestId('task-table-graphql')).toHaveAttribute('data-button-disabled', 'false');
    });
    it('sets loading to false after fetch completes', async () => {
        (getTasksDBRows as jest.Mock).mockResolvedValue([]);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
    });
    describe('Error Handling', () => {
      it('logs error message when getTasksDBRows fails', async () => {
          const errorMessage = 'Failed to connect to database';
          const mockError = new Error(errorMessage);
          (getTasksDBRows as jest.Mock).mockRejectedValue(mockError);

          // The component throws the error, so we need to catch it
          const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

          render(<TaskGraphQLPage />);
          await waitFor(() => {
              expect(consoleSpy.mock.calls[0][0]).toContain(
                "Error: failed to obtain JWT from AWS Secret Manager ", 
              );
              expect(consoleSpy.mock.calls[1][0]).toContain(
                "use-server | view | taskGraphQLPage | useEffect - getTasksDBRows | catched error: Error - Failed to connect to database", 
              );
              expect(consoleSpy.mock.calls[2][0]).toContain(
                "VERIFY_JWT_STRING | VERIFY_JWT | Unknown JWT error", 
              );
          });          

          consoleSpy.mockRestore();
      });
      it('sets loading to false even when error occurs', async () => {
          const mockError = new Error('Database error');
          (getTasksDBRows as jest.Mock).mockRejectedValue(mockError);

          try {
              render(<TaskGraphQLPage />);
              await waitFor(() => {
                  // Component should throw, but loading should be handled in finally block
              });
          } catch (error) {
              // Expected to throw
          }
      });
      it('handles non-Error objects in catch block', async () => {
          const nonErrorObject = 'string error';
          (getTasksDBRows as jest.Mock).mockRejectedValue(nonErrorObject);

          // Should not log to console or throw when it's not an Error instance
          render(<TaskGraphQLPage />);

          await waitFor(() => {
              expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
          });
      });
    });
    describe('Props Passed to Child Components', () => {
      it('passes correct props to TaskSeedDBGraphQL', async () => {
        const mockTasks = [{ id: 1, title: 'Task 1', completed: false }];
            (getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

            render(<TaskGraphQLPage />);

            await waitFor(() => {
                expect(TaskSeedDBGraphQL).toHaveBeenCalledWith(
                    expect.objectContaining({
                        tasks: mockTasks,
                        setTasks: expect.any(Function),
                        seedTaskDB: seedTaskDB,
                        deleteAllRows: deleteAllRows,
                        buttonDisabled: false,
                        setButtonDisabled: expect.any(Function),
                    }),
                    undefined
                );
                // for reference: react context is undefined instead of {} because we mock the component with jest.fn() hence 
                // no context passed 
            });
      });
      it('passes correct props to TaskTableGraphQL', async () => {
        const mockTasks = [{ id: 1, title: 'Task 1', completed: false }];
        (getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

        render(<TaskGraphQLPage />);

        await waitFor(() => {
            expect(TaskTableGraphQL).toHaveBeenCalledWith(
                expect.objectContaining({
                    tasks: mockTasks,
                    setTasks: expect.any(Function),
                    createRow: createRow,
                    updateRowFromId: updateRowFromId,
                    buttonDisabled: false,
                    setButtonDisabled: expect.any(Function),
                }),
                undefined
            );
            // for reference: react context is undefined instead of {} because we mock the component with jest.fn() hence 
            // no context passed 
        });
      });
    });
    describe('useEffect Dependency Array', () => {
      it('fetchTasks is called only once on mount', async () => {
          (getTasksDBRows as jest.Mock).mockResolvedValue([]);

          const { rerender } = render(<TaskGraphQLPage />);

          await waitFor(() => {
              expect(getTasksDBRows).toHaveBeenCalledTimes(1);
          });

          // Re-render the component
          rerender(<TaskGraphQLPage />);

          // Should still be called only once
          expect(getTasksDBRows).toHaveBeenCalledTimes(1);
      });
    });
  });
});
