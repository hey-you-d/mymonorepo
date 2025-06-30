// Mock the dependencies
jest.mock('./taskUser');
jest.mock('../../../viewModels/Task/use-client/useTasksViewModel');

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskPage } from './taskPage';
import { useTaskViewModel } from '@/viewModels/Task/use-client/useTasksViewModel';
import type { Task } from '@/types/Task';

// the approach below only works for named export, not default export
//require('../../../components/Task/use-client/TaskSeedDB').TaskSeedDB = MockTaskSeedDB;
// the approach below works for default export
jest.mock('../../../components/Task/use-client/TaskSeedDB', () => ({
    __esModule: true,
    default: jest.fn(({ 
      totalRows, 
      seedTaskDB, 
      deleteAllRows, 
      buttonDisabled, 
      setButtonDisabled,
      userAuthenticated 
    }) => (
      <div data-testid="task-seed-db">
        <span>Total Rows: {totalRows}</span>
        <button onClick={seedTaskDB} disabled={buttonDisabled}>Seed DB</button>
        <button onClick={deleteAllRows} disabled={buttonDisabled}>Delete All</button>
        <button onClick={() => setButtonDisabled(!buttonDisabled)}>
          Toggle Disabled: {buttonDisabled ? 'Disabled' : 'Enabled'}
        </button>
      </div>
    ))
}));

// the approach below only works for named export, not default export
//require('../../../components/Task/use-client/TaskTable').TaskTable = MockTaskTable;  
// the approach below works for default export
jest.mock('../../../components/Task/use-client/TaskTable', () => ({
    __esModule: true,
    default: jest.fn(({ 
      tasks, 
      createRow, 
      updateRowFromId, 
      buttonDisabled,
      setButtonDisabled,
      userAuthenticated 
    }) => (
      <div data-testid="task-table">
        <span>Tasks Count: {tasks.length}</span>
        <button onClick={() => createRow({ id: 'new', detail: 'New Task' })}>Create Row</button>
        <button onClick={() => updateRowFromId('1', { detail: 'Updated' })}>Update Row</button>
        {tasks.map((task: Task) => (
          <div key={task.id} data-testid={`task-${task.id}`}>
            {task.detail}
          </div>
        ))}
      </div>
    ))
}));

require('./taskUser').default = jest.fn(({ userAuthenticated, setUserAuthenticated }) => (
  <div data-testid="task-user">
    <button onClick={() => setUserAuthenticated(!userAuthenticated)}>
      Toggle Auth: {userAuthenticated ? 'Authenticated' : 'Not Authenticated'}
    </button>
  </div>
));

const mockUseTaskViewModel = useTaskViewModel as jest.MockedFunction<typeof useTaskViewModel>;

describe('TaskPage', () => {
  const mockTasks: Task[] = [
    { id: 1, title: 'title 1', detail: 'Complete project documentation', completed: true, created_at: '' },
    { id: 2, title: 'title 2', detail: 'Review code changes', completed: true, created_at: ''  },
    { id: 3, title: 'title 3', detail: 'Update test cases', completed: false, created_at: ''  },
  ];

  const mockViewModelReturn = {
    tasks: mockTasks,
    loading: false,
    error: { name: "error", message: "error detected" },
    getTasksDBRows: jest.fn(),
    deleteAllRows: jest.fn(),
    seedTasksDB: jest.fn(),
    getRowFromId: jest.fn(),
    createRow: jest.fn(),
    updateRowFromId: jest.fn(),
    deleteRowFromId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskViewModel.mockReturnValue(mockViewModelReturn);
  });

  describe('Loading States', () => {
    it('renders loading message when loading is true', () => {
      mockUseTaskViewModel.mockReturnValue({
        ...mockViewModelReturn,
        loading: true,
      });

      render(<TaskPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('still renders the page title when tasks is undefined and not loading', () => {
      mockUseTaskViewModel.mockReturnValue({
        ...mockViewModelReturn,
        tasks: undefined,
        loading: false,
      });

      const { container } = render(<TaskPage />);
      expect(container.firstChild).toContainHTML("<h2>Default (No frills) example: MVVM client-side components rendered via Next.js Page Router</h2>");
    });
  });

  describe('Component Rendering', () => {
    it('renders all main components when tasks exist', () => {
      render(<TaskPage />);

      expect(screen.getByTestId('task-user')).toBeInTheDocument();
      expect(screen.getByTestId('task-seed-db')).toBeInTheDocument();
      expect(screen.getByTestId('task-table')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter detail...')).toBeInTheDocument();
    });

    it('passes correct props to child components', () => {
      render(<TaskPage />);

      // Check TaskSeedDB props
      expect(screen.getByText('Total Rows: 3')).toBeInTheDocument();
      
      // Check TaskTable props
      expect(screen.getByText('Tasks Count: 3')).toBeInTheDocument();
      
      // Check all tasks are displayed
      expect(screen.getByTestId('task-1')).toHaveTextContent('Complete project documentation');
      expect(screen.getByTestId('task-2')).toHaveTextContent('Review code changes');
      expect(screen.getByTestId('task-3')).toHaveTextContent('Update test cases');
    });
  });

  describe('Filter Functionality', () => {
    it('filters tasks based on filter text', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      fireEvent.change(filterInput, { target: { value: 'project' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 1')).toBeInTheDocument();
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.queryByTestId('task-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('task-3')).not.toBeInTheDocument();
      });
    });

    it('is case insensitive when filtering', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      fireEvent.change(filterInput, { target: { value: 'CODE' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 1')).toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
      });
    });

    it('shows all tasks when filter is cleared', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      // First filter
      fireEvent.change(filterInput, { target: { value: 'project' } });
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 1')).toBeInTheDocument();
      });
      
      // Clear filter
      fireEvent.change(filterInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 3')).toBeInTheDocument();
      });
    });

    it('handles filter text with only whitespace', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      fireEvent.change(filterInput, { target: { value: '   ' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 3')).toBeInTheDocument();
      });
    });
  });
  
  describe('Button Disabled State', () => {
    it('disables buttons when filter text is present', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      fireEvent.change(filterInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Seed DB')).toBeDisabled();
        expect(screen.getByText('Delete All')).toBeDisabled();
      });
    });

    it('enables buttons when filter text is empty', async () => {
      render(<TaskPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      
      // First add filter text
      fireEvent.change(filterInput, { target: { value: 'test' } });
      await waitFor(() => {
        expect(screen.getByText('Seed DB')).toBeDisabled();
      });
      
      // Then clear it
      fireEvent.change(filterInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Seed DB')).not.toBeDisabled();
        expect(screen.getByText('Delete All')).not.toBeDisabled();
      });
    });
  });

  describe('User Authentication', () => {
    it('manages user authentication state', () => {
      render(<TaskPage />);
      
      const toggleButton = screen.getByText(/Toggle Auth:/);
      
      expect(screen.getByText('Toggle Auth: Not Authenticated')).toBeInTheDocument();
      
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Toggle Auth: Authenticated')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('calls seedTasksDB function when seed button is clicked', () => {
      render(<TaskPage />);
      
      const seedButton = screen.getByText('Seed DB');
      fireEvent.click(seedButton);
      
      expect(mockViewModelReturn.seedTasksDB).toHaveBeenCalledTimes(1);
    });

    it('calls deleteAllRows function when delete all button is clicked', () => {
      render(<TaskPage />);
      
      const deleteButton = screen.getByText('Delete All');
      fireEvent.click(deleteButton);
      
      expect(mockViewModelReturn.deleteAllRows).toHaveBeenCalledTimes(1);
    });

    it('calls createRow function when create button is clicked', () => {
      render(<TaskPage />);
      
      const createButton = screen.getByText('Create Row');
      fireEvent.click(createButton);
      
      expect(mockViewModelReturn.createRow).toHaveBeenCalledWith({
        id: 'new',
        detail: 'New Task'
      });
    });

    it('calls updateRowFromId function when update button is clicked', () => {
      render(<TaskPage />);
      
      const updateButton = screen.getByText('Update Row');
      fireEvent.click(updateButton);
      
      expect(mockViewModelReturn.updateRowFromId).toHaveBeenCalledWith('1', {
        detail: 'Updated'
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tasks array', () => {
      mockUseTaskViewModel.mockReturnValue({
        ...mockViewModelReturn,
        tasks: [],
      });

      render(<TaskPage />);
      
      expect(screen.getByText('Tasks Count: 0')).toBeInTheDocument();
      expect(screen.getByText('Total Rows: 0')).toBeInTheDocument();
    });

    it('still renders the page title when tasks becoming undefined after initial render', () => {
      const { rerender } = render(<TaskPage />);
      
      expect(screen.getByTestId('task-table')).toBeInTheDocument();
      
      mockUseTaskViewModel.mockReturnValue({
        ...mockViewModelReturn,
        tasks: undefined,
      });
      
      rerender(<TaskPage />);
      
      const { container } = render(<TaskPage />);
      expect(container.firstChild).toContainHTML("<h2>Default (No frills) example: MVVM client-side components rendered via Next.js Page Router</h2>");
    });

    it('updates filtered tasks when tasks prop changes', async () => {
      const { rerender } = render(<TaskPage />);
      
      expect(screen.getByText('Tasks Count: 3')).toBeInTheDocument();
      
      const newTasks: Task[] = [
        { id: 4, title: 'title 4', detail: 'New task added', completed: false, created_at: '' },
      ];
      
      mockUseTaskViewModel.mockReturnValue({
        ...mockViewModelReturn,
        tasks: newTasks,
      });
      
      rerender(<TaskPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tasks Count: 1')).toBeInTheDocument();
        expect(screen.getByTestId('task-4')).toBeInTheDocument();
      });
    });
  });
});  

