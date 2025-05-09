import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useTaskApolloClientViewModel } from './useTaskApolloClientViewModel';
import { GET_ALL_TASKS } from './useTaskApolloClientViewModel';

// Test component to expose the hook
const TestComponent = () => {
    const { tasks, loading: isLoading, error: errorMsg } = useTaskApolloClientViewModel();
  
    if (isLoading) return <p>Loading...</p>;
    if (errorMsg) return <p>Error: {errorMsg}</p>;
  
    return (
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    );
};

// Mock GraphQL response
const mockTasks = [
    { id: '1', title: 'Task 1', detail: 'Detail 1', completed: false },
    { id: '2', title: 'Task 2', detail: 'Detail 2', completed: true },
];

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
});
  