import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MockedProvider } from '@apollo/client/testing';
import { 
    useTaskApolloClientViewModel, 
    GET_ALL_TASKS, 
    CREATE_A_TASK, 
    DELETE_ALL_TASKS,
    SEED_TASKS, 
    UPDATE_A_TASK,
} from './useTaskApolloClientViewModel';

// Test component to expose the hook
type OpType = "seed" | "create" | "delete" | "update" | "get"; 
const TestComponent = ({mode = "get", onError}: {mode: OpType, onError?: (error: string) => void}) => {
    const { 
        tasks, loading: isLoading, error: errorMsg, 
        createRow, deleteAllRows, seedTaskDB, updateRowFromId, 
    } = useTaskApolloClientViewModel();

    // Call onError callback when error occurs
    React.useEffect(() => {
        if (errorMsg && onError) {
            onError(errorMsg);
        }
    }, [errorMsg, onError]);
  
    return (
      <>
        {mode === "seed" &&
            <button onClick={seedTaskDB}>Seed DB</button>
        }
        {mode === "create" &&
            <button onClick={() => createRow(tasks, 'Test Task', 'Test Detail')}>Add Task</button>
        }    
        {mode === "update" && 
            <button onClick={() => updateRowFromId(tasks, 999, 'Updated Title', 'Updated Detail', true)}>
                Update Task
            </button>
        }
        {mode === "delete" &&
            <button onClick={deleteAllRows}>Delete All</button>
        }
        {isLoading && <p>Loading...</p>}
        {errorMsg && <p>Error: {errorMsg}</p>}  
        <ul>
            {tasks.map(task => (
                <li key={task.id}>{task.title}</li>
            ))}
        </ul>
      </>
    );
};

// Mock GraphQL response
const mockTasks = [
    { id: '1', title: 'Task 1', detail: 'Detail 1', completed: false },
    { id: '2', title: 'Task 2', detail: 'Detail 2', completed: true },
];

// for reference: Even though you're testing createRow, the useQuery(GET_ALL_TASKS) still runs when the hook initializes 
// and Apollo Client expects a mock for it.
const getTasksMock = {
    request: {
        query: GET_ALL_TASKS,
    },
    result: {
        data: {
            tasks: [], // Assume initially no tasks
        },
    },
};

describe('useTaskApolloClientViewModel', () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    let spyConsoleLog: jest.SpyInstance<any, any>;

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
    });

    it('GET_ALL_TASKS -> fetches and renders tasks correctly', async () => {
        const getAllDataMocks = [
            {
                request: {
                    query: GET_ALL_TASKS,
                },
                result: {
                    data: {
                    tasks: mockTasks,
                    },
                },
            },
        ];

        const { getByText } = render(
            <MockedProvider mocks={getAllDataMocks} addTypename={false}>
              <TestComponent mode="get" />
            </MockedProvider>
        );

        // Initially shows loading
        expect(getByText('Loading...')).toBeInTheDocument();

        // Wait for the tasks to load
        await waitFor(() => {
            expect(getByText('Task 1')).toBeInTheDocument();
            expect(getByText('Task 2')).toBeInTheDocument();
        });
    });

    it('GET_ALL_TASKS -> handles GraphQL errors gracefully', async () => {
        const errorMocks = [
            {
              request: {
                query: GET_ALL_TASKS,
              },
              error: new Error('GraphQL error'),
            },
        ];

        const { getByText } = render(
            <MockedProvider mocks={errorMocks} addTypename={false}>
                <TestComponent mode="get" />
            </MockedProvider>
        );

        expect(getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Error: GraphQL error/i)).toBeInTheDocument();
        });
    });

    it('CREATE_A_TASK -> creates a task and adds it to the list', async () => {
        const createTaskMock = {
            request: {
              query: CREATE_A_TASK,
              variables: {
                title: 'Test Task',
                detail: 'Test Detail',
              },
            },
            result: {
              data: {
                createTask: {
                  id: '123',
                  title: 'Test Task',
                  detail: 'Test Detail',
                  completed: false,
                  created_at: '2025-01-01',
                },
              },
            },
        };

        const { getByText, findByText } = render(
            <MockedProvider mocks={[getTasksMock, createTaskMock]} addTypename={false}>
                <TestComponent mode="create" />
            </MockedProvider>
        );

        const button = getByText('Add Task');
        // for reference: must use fireEvent otherwise act related warning will appear. 
        // however, don't use manual act. This is typically unnecessary and 
        // can even obscure errors — stick with waitFor() or findBy*() when possible.
        fireEvent.click(button);

        // Wait for the task to appear
        const newTask = await findByText('Test Task');
        expect(newTask).toBeInTheDocument();
        const listItems = document.querySelectorAll('li');
        expect(listItems.length).toBe(1);
    });

    it('CREATE_A_TASK -> handles GraphQL errors gracefully', async () => {
        const createErrorMock = {
            request: {
              query: CREATE_A_TASK,
              variables: {
                title: 'Test Task',
                detail: 'Test Detail',
              },
            },
            result: {
              errors: [new GraphQLError('Mocked createTask error')],
            },
        };

        const onErrorSpy = jest.fn();

        const { getByText } = render(
            <MockedProvider mocks={[createErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="create" onError={onErrorSpy} />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Add Task'));
        
        await waitFor(() => {
            expect(onErrorSpy).toHaveBeenCalledWith('use-client | view-model | useTaskApolloClientViewModel | createRow | catched error: ApolloError - Mocked createTask error');
        });
    });

    // to test this case: if (!mutatedData?.createTask) { throw new Error('No task returned'); }
    it('CREATE_A_TASK -> test if mutatedData is null', async () => {
        const createNullMock = {
            request: {
              query: CREATE_A_TASK,
              variables: {
                title: 'Test Task',
                detail: 'Test Detail',
              },
            },
            result: {
              data: {
                createTask: null,
              },
            },
        };

        const onErrorSpy = jest.fn();

        const { getByText } = render(
            <MockedProvider mocks={[createNullMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="create" onError={onErrorSpy} />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Add Task'));
        
        await waitFor(() => {
            expect(onErrorSpy).toHaveBeenCalledWith('use-client | view-model | useTaskApolloClientViewModel | createRow | catched error: Error - No task returned');
        });
    });

    it('DELETE_ALL_TASKS -> deletes all tasks successfully', async () => {
        const deleteTasksMock = {
            request: {
              query: DELETE_ALL_TASKS,
            },
            result: {
              data: {
                deleteTasks: [
                  {
                    id: '1',
                    title: 'Sample Task',
                    detail: 'Detail',
                    completed: false,
                    created_at: '2025-01-01',
                  },
                ],
              },
            },
        };

        const { getByText, queryByText } = render(
            <MockedProvider mocks={[deleteTasksMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="delete" />
            </MockedProvider>
        );

        fireEvent.click(getByText('Delete All'));
        
        await waitFor(() => {
            expect(queryByText(/Error:/i)).not.toBeInTheDocument();
            expect(queryByText(/Loading.../i)).not.toBeInTheDocument();
            const listItems = document.querySelectorAll('li');
            expect(listItems.length).toBe(0);
        });
    });


    it('DELETE_ALL_TASKS -> shows error message when deletion fails', async () => {
        const deleteTasksErrorMock = {
            request: {
              query: DELETE_ALL_TASKS,
            },
            error: new Error('Delete failed'),
        };
        
        const onErrorSpy = jest.fn();

        const { getByText } = render(
            <MockedProvider mocks={[deleteTasksErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="delete" onError={onErrorSpy} />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Delete All'));
        
        await waitFor(() => {
            expect(onErrorSpy).toHaveBeenCalledWith('use-client | view-model | useTaskApolloClientViewModel | deleteAllRows | catched error: ApolloError - Delete failed');
        });
    });

    it('SEED_TASKS -> seed tasks and adds the data set to the list', async () => {
        const seedTasksMock = {
            request: {
              query: SEED_TASKS,
            },
            result: {
              data: {
                seedTasks: [
                    {
                        id: '1',
                        title: 'Test Task',
                        detail: 'Test Detail',
                        completed: false,
                        created_at: '2025-01-01',
                    }, 
                    {
                        id: '2',
                        title: 'Test Task 2',
                        detail: 'Test Detail 2',
                        completed: false,
                        created_at: '2025-01-01',
                    }
                ],
              },
            },
        };

        const { getByText, findByText } = render(
            <MockedProvider mocks={[getTasksMock, seedTasksMock]} addTypename={false}>
                <TestComponent mode="seed" />
            </MockedProvider>
        );

        const button = getByText('Seed DB');
        // for reference: must use fireEvent otherwise act related warning will appear. 
        // however, don't use manual act. This is typically unnecessary and 
        // can even obscure errors — stick with waitFor() or findBy*() when possible.
        fireEvent.click(button);

        const newTask = await findByText('Test Task');
        const newTask2 = await findByText('Test Task 2');
        // Wait for the task to appear
        await waitFor(() => {
            expect(newTask).toBeInTheDocument();
            expect(newTask2).toBeInTheDocument();
            const listItems = document.querySelectorAll('li');
            expect(listItems.length).toBe(2);
        });
    });

    it('SEED_TASKS -> handles GraphQL errors gracefully', async () => {
        const createErrorMock = {
            request: {
              query: SEED_TASKS,
            },
            result: {
              errors: [new GraphQLError('Mocked seedTask error')],
            },
        };

        const onErrorSpy = jest.fn();

        const { getByText } = render(
            <MockedProvider mocks={[createErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="seed" onError={onErrorSpy} />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Seed DB'));
        
        await waitFor(() => {
            expect(onErrorSpy).toHaveBeenCalledWith('use-client | view-model | useTaskApolloClientViewModel | seedTaskDB | catched error: ApolloError - Mocked seedTask error');
        });
    });

    it('UPDATE_A_TASK -> modifies existing task in list', async () => {
        const getTasksMockForUpdate = {
            request: {
                query: GET_ALL_TASKS,
            },
            result: {
                data: {
                    tasks: [
                        {
                            id: 999,
                            title: 'Pre-Updated Title',
                            detail: 'Pre-Updated Detail',
                            completed: false,
                            created_at: '2025-01-01',
                        }
                    ],
                },
            },
        }
        
        const updateTaskMock = {
          request: {
            query: UPDATE_A_TASK,
            variables: {
              id: 999,
              title: 'Updated Title',
              detail: 'Updated Detail',
              completed: true,
            },
          },
          result: {
            data: {
              updateTask: {
                id: 999,
                title: 'Updated Title',
                detail: 'Updated Detail',
                completed: true,
                created_at: '2025-01-01',
              },
            },
          },
        };
      
        const { getByText, queryByText, findByText } = render(
          <MockedProvider mocks={[updateTaskMock, getTasksMockForUpdate]} addTypename={false}>
            <TestComponent mode="update" />
          </MockedProvider>
        );
      
        // Initially should see the placeholder item
        await waitFor(() => {
            expect(getByText('Pre-Updated Title')).toBeInTheDocument();
        });
        
        // Trigger the update
        fireEvent.click(getByText('Update Task'));
      
        // Should replace the placeholder with updated task
        await waitFor(() => {
          expect(queryByText('Pre-Updated Title')).not.toBeInTheDocument();
          expect(getByText('Updated Title')).toBeInTheDocument();
        });
    });
    
    it('UPDATE_A_TASK -> handles GraphQL errors gracefully', async () => {
        const createErrorMock = {
            request: {
              query: UPDATE_A_TASK,
              variables: {
                id: 999,
                title: 'Updated Title',
                detail: 'Updated Detail',
                completed: true,
              },
            },
            result: {
              errors: [new GraphQLError('Mocked createTask error')],
            },
        };

        const onErrorSpy = jest.fn();

        const { getByText } = render(
            <MockedProvider mocks={[createErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent mode="update" onError={onErrorSpy} />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Update Task'));
        
        await waitFor(() => {
            expect(onErrorSpy).toHaveBeenCalledWith('use-client | view-model | useTaskApolloClientViewModel | updateRowFromId [id: 999] | catched error: ApolloError - Mocked createTask error');
        });
    });
});
  