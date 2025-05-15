import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { useTaskGraphQLViewModel } from './useTaskGraphQLViewModel';
import { fetchGraphQL } from '@/app/models/Task/use-client/TaskGraphqlClient';

// Mock the fetchGraphQL function
jest.mock('../../../models/Task/use-client/TaskGraphqlClient', () => ({
  fetchGraphQL: jest.fn(),
}));

const mockTasks = [
  { id: 1, title: 'Test Task', detail: 'Details', completed: false }
];

// Test component to expose the hook
const TestComponent = ({ onRender }: { onRender: (vm: ReturnType<typeof useTaskGraphQLViewModel>) => void }) => {
  const vm = useTaskGraphQLViewModel();
  onRender(vm);
  return null;
};

describe('useTaskGraphQLViewModel', () => {
  let spyConsoleError: jest.SpyInstance<any, any>;

  beforeEach(() => {
    // suppress console.error to reduce noise
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  it('loads tasks on mount', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValue({ tasks: mockTasks });
    
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(viewModel.loading).toBe(false);
      expect(viewModel.tasks).toEqual(mockTasks);
      expect(viewModel.error).toBeNull();
    });
  });

  it('sets error when fetchGraphQL fails', async () => {
    (fetchGraphQL as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
  
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
  
    // Wait for loading to complete
    await waitFor(() => {
      expect(viewModel.loading).toBe(false)
      expect(viewModel.error).toBe('error: Failed to fetch');
    });
  });
  
  it('createRow -> creates a new task and prepends it to the list', async () => {
    const newTask = { id: 2, title: 'New', detail: 'New Detail', completed: false };

    (fetchGraphQL as jest.Mock)
      .mockResolvedValueOnce({ tasks: mockTasks }) // initial load
      .mockResolvedValueOnce({ createTask: newTask }); // for createRow
  
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
    
    await waitFor(() => {
      expect(viewModel.loading).toBe(false);
      
      viewModel.createRow('New', 'New Detail');
    });

    await waitFor(() => {
      expect(viewModel.tasks[0]).toEqual(newTask);
      expect(viewModel.tasks.length).toBe(2);
    });
  });
  
  it('updateRowFromId -> updates a task by id', async () => {
    const updatedTask = { ...mockTasks[0], title: 'Updated', completed: true };
    (fetchGraphQL as jest.Mock)
      .mockResolvedValueOnce({ tasks: mockTasks }) // initial load
      .mockResolvedValueOnce({ updateTask: updatedTask }); // for update
  
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
    await waitFor(() => { 
      expect(viewModel.loading).toBe(false)
      viewModel.updateRowFromId(1, 'Updated', 'Details', true);
    });
  
    await waitFor(() => {
      expect(viewModel.tasks[0]).toEqual(updatedTask);
    });
  });
  
  it('deleteAllRows -> clears tasks after deleteAllRows', async () => {
    (fetchGraphQL as jest.Mock)
      .mockResolvedValueOnce({ tasks: mockTasks }) // initial
      .mockResolvedValueOnce({}); // delete mutation
  
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
    await waitFor(() => {
      expect(viewModel.loading).toBe(false)
      
      viewModel.deleteAllRows();
    });


    await waitFor(() => {
      expect(viewModel.tasks).toEqual([]);
    });
  });
  
  it('seedTaskDB -> adds hardcoded sample data to the current list', async () => {
    const seeded = [
      { id: 1, title: 'Seed 1', detail: 'Seed Detail', completed: false },
      { id: 2, title: 'Seed 2', detail: 'Seed Detail', completed: false },
      { id: 3, title: 'Seed 3', detail: 'Seed Detail', completed: false }
    ];

    (fetchGraphQL as jest.Mock)
      .mockResolvedValueOnce({ tasks: mockTasks }) // initial GET
      .mockResolvedValueOnce({ seedTasks: seeded }); // Correct structure for seed
  
    let viewModel: ReturnType<typeof useTaskGraphQLViewModel>;
    render(<TestComponent onRender={(vm) => (viewModel = vm)} />);
    await waitFor(() => {
      expect(viewModel.loading).toBe(false)
    });

    // Run the seed operation
    await act(async () => {
      await viewModel.seedTaskDB();
    });

    await waitFor(() => {
      expect(viewModel.tasks.length).toBe(3);
      expect(viewModel.tasks[0]).toEqual(seeded[0]);
      expect(viewModel.tasks[1]).toEqual(seeded[1]);
      expect(viewModel.tasks[2]).toEqual(seeded[2]);
    });
  });
  
});

