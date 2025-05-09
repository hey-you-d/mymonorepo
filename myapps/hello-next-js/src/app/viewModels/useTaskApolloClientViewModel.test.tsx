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
} from './useTaskApolloClientViewModel';

// Test component to expose the hook
const TestComponent = () => {
    const { 
        tasks, loading: isLoading, error: errorMsg, 
        createRow, deleteAllRows, seedTaskDB 
    } = useTaskApolloClientViewModel();
  
    return (
      <>
        <button onClick={seedTaskDB}>Seed DB</button>
        <button onClick={() => createRow('Test Task', 'Test Detail')}>Add Task</button>
        <button onClick={deleteAllRows}>Delete All</button>
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

// dev note: Even though you're testing createRow, the useQuery(GET_ALL_TASKS) still runs when the hook initializes 
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
              <TestComponent />
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
                <TestComponent />
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
                <TestComponent />
            </MockedProvider>
        );

        const button = getByText('Add Task');
        // dev note: must use fireEvent otherwise act related warning will appear. 
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

        const { getByText } = render(
            <MockedProvider mocks={[createErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Add Task'));
        
        await waitFor(() => {
            expect(getByText(/Error: Mocked createTask error/i)).toBeInTheDocument();
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
        
        const { getByText } = render(
            <MockedProvider mocks={[createNullMock, getTasksMock]} addTypename={false}>
              <TestComponent />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Add Task'));
        
        await waitFor(() => {
            expect(getByText(/Error: No task returned/i)).toBeInTheDocument();
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
              <TestComponent />
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
        
        const { getByText, findByText } = render(
            <MockedProvider mocks={[deleteTasksErrorMock, getTasksMock]} addTypename={false}>
                <TestComponent />
            </MockedProvider>
        );
    
        fireEvent.click(getByText('Delete All'));
    
        expect(await findByText(/Error: error: Delete failed/i)).toBeInTheDocument();
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
                <TestComponent />
            </MockedProvider>
        );

        const button = getByText('Seed DB');
        // dev note: must use fireEvent otherwise act related warning will appear. 
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
              errors: [new GraphQLError('Mocked createTask error')],
            },
        };

        const { getByText } = render(
            <MockedProvider mocks={[createErrorMock, getTasksMock]} addTypename={false}>
              <TestComponent />
            </MockedProvider>
        );
        
        fireEvent.click(getByText('Seed DB'));
        
        await waitFor(() => {
            expect(getByText(/Error: Mocked createTask error/i)).toBeInTheDocument();
        });
    });
});
  