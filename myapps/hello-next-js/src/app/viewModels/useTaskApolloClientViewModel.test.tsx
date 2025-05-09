import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MockedProvider } from '@apollo/client/testing';
import { useTaskApolloClientViewModel, GET_ALL_TASKS, CREATE_A_TASK } from './useTaskApolloClientViewModel';

// Test component to expose the hook
const TestComponent = () => {
    const { tasks, loading: isLoading, error: errorMsg, createRow } = useTaskApolloClientViewModel();
  
    return (
      <>
        <button onClick={() => createRow('Test Task', 'Test Detail')}>Add Task</button>
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
    beforeEach(() => {
        jest.clearAllMocks();
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
              <TestComponent />
            </MockedProvider>
        );

        // Initially shows loading
        expect(getByText('Loading...')).toBeInTheDocument;

        // Wait for the tasks to load
        await waitFor(() => {
            expect(getByText('Task 1')).toBeInTheDocument;
            expect(getByText('Task 2')).toBeInTheDocument;
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

        expect(getByText('Loading...')).toBeInTheDocument;

        await waitFor(() => {
            expect(getByText(/Error: GraphQL error/i)).toBeInTheDocument;
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
        expect(newTask).toBeInTheDocument;
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
            expect(getByText(/Error: Mocked createTask error/i)).toBeInTheDocument;
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
            expect(getByText(/Error: No task returned/i)).toBeInTheDocument;
        });
    });
});
  