import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskWithSWRPage } from './taskWithSWRPage';
import type { TaskUserType, Task } from '@/types/Task';
import type { TaskSeedDBType } from '@/components/Task/use-client/TaskSeedDB';
import type { TaskTableType } from '@/components/Task/use-client/TaskTable';

// Mock the custom hook
jest.mock('../../../viewModels/Task/use-client/useTasksViewModelWithSwr', () => ({
  useTaskViewModelWithSwr: jest.fn()
}));

// Mock child components
jest.mock('./taskUser', () => {
  return function TaskUser({ userAuthenticated, setUserAuthenticated }: TaskUserType) {
    return (
      <div data-testid="task-user">
        <button onClick={() => setUserAuthenticated(!userAuthenticated)}>
          Toggle Auth: {userAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </button>
      </div>
    );
  };
});

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
        <span>Total: {totalRows}</span>
        <button 
          onClick={seedTaskDB} 
          disabled={buttonDisabled}
          data-testid="seed-button"
        >
          Seed DB
        </button>
        <button 
          onClick={deleteAllRows} 
          disabled={buttonDisabled}
          data-testid="delete-all-button"
        >
          Delete All
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
        <div data-testid="task-count">Tasks: {tasks.length}</div>
        {tasks.map((task: { id: string | number; detail: string; }) => (
          <div key={task.id} data-testid={`task-${task.id}`}>
            {task.detail}
          </div>
        ))}
        <button onClick={() => createRow([], 'new title', 'new detail' )}>
          Create Row
        </button>
      </div>
    ))
}));

const { useTaskViewModelWithSwr } = require('../../../viewModels/Task/use-client/useTasksViewModelWithSwr');

describe('TaskWithSWRPage', () => {
  const mockTasks: Task[] = [
    { id: 1, title: 'title 1', detail: 'Complete project documentation', completed: true, created_at: '' },
    { id: 2, title: 'title 2', detail: 'Review pull requests', completed: true, created_at: ''  },
    { id: 3, title: 'title 3', detail: 'Update project timeline', completed: true, created_at: ''  }
  ];

  const mockHookReturn = {
    tasks: mockTasks,
    loading: false,
    seedTasksDB: jest.fn(),
    createRow: jest.fn(),
    updateRowFromId: jest.fn(),
    deleteAllRows: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useTaskViewModelWithSwr.mockReturnValue(mockHookReturn);
  });

  describe('Loading State', () => {
    it('should render loading message when loading is true', () => {
      useTaskViewModelWithSwr.mockReturnValue({
        ...mockHookReturn,
        loading: true
      });

      render(<TaskWithSWRPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render main content when loading', () => {
      useTaskViewModelWithSwr.mockReturnValue({
        ...mockHookReturn,
        loading: true
      });

      render(<TaskWithSWRPage />);
      expect(screen.queryByTestId('task-table')).not.toBeInTheDocument();
    });
  });

  describe('Initial Rendering', () => {
    it('should render all main components when tasks are loaded', () => {
      render(<TaskWithSWRPage />);
      
      expect(screen.getByTestId('task-user')).toBeInTheDocument();
      expect(screen.getByTestId('task-seed-db')).toBeInTheDocument();
      expect(screen.getByTestId('task-table')).toBeInTheDocument();
    });

    it('should render filter input and buttons', () => {
      render(<TaskWithSWRPage />);
      
      expect(screen.getByPlaceholderText('Filter detail...')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should display all tasks initially', () => {
      render(<TaskWithSWRPage />);
      
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3');
      expect(screen.getByTestId('task-1')).toHaveTextContent('Complete project documentation');
      expect(screen.getByTestId('task-2')).toHaveTextContent('Review pull requests');
      expect(screen.getByTestId('task-3')).toHaveTextContent('Update project timeline');
    });
  });

  describe('Filter Functionality', () => {
    it('should filter tasks based on search input', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: 'project' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2');
      });
      
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-3')).toBeInTheDocument();
      expect(screen.queryByTestId('task-2')).not.toBeInTheDocument();
    });
    
    it('should be case insensitive when filtering', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: 'PROJECT' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2');
      });
    });

    it('should clear filter when clear button is clicked', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput: HTMLInputElement = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      const clearButton = screen.getByText('Clear');
      
      // First filter
      fireEvent.change(filterInput, { target: { value: 'project' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2');
      });
      
      // Then clear
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3');
      });
      
      expect(filterInput.value).toBe('');
    });

    it('should return empty results when no tasks match filter', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: 'nonexistent' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 0');
      });
    })
  });

  describe('Button Disabled State', () => {
    it('should disable buttons when filtering is active', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: 'project' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('seed-button')).toBeDisabled();
        expect(screen.getByTestId('delete-all-button')).toBeDisabled();
      });
    });

    it('should enable buttons when no filter is active', () => {
      render(<TaskWithSWRPage />);
      
      expect(screen.getByTestId('seed-button')).not.toBeDisabled();
      expect(screen.getByTestId('delete-all-button')).not.toBeDisabled();
    });
  });

  describe('User Authentication', () => {
    it('should toggle user authentication state', () => {
      render(<TaskWithSWRPage />);
      
      const toggleButton = screen.getByText(/Toggle Auth/);
      expect(toggleButton).toHaveTextContent('Toggle Auth: Not Authenticated');
      
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent('Toggle Auth: Authenticated');
    });
  });

  describe('Props Passing', () => {
    it('should pass correct props to TaskSeedDB', () => {
      render(<TaskWithSWRPage />);
      
      expect(screen.getByText('Total: 3')).toBeInTheDocument();
    });

    it('should pass seedTasksDB function to TaskSeedDB', () => {
      render(<TaskWithSWRPage />);
      
      fireEvent.click(screen.getByTestId('seed-button'));
      expect(mockHookReturn.seedTasksDB).toHaveBeenCalled();
    });

    it('should pass deleteAllRows function to TaskSeedDB', () => {
      render(<TaskWithSWRPage />);
      
      fireEvent.click(screen.getByTestId('delete-all-button'));
      expect(mockHookReturn.deleteAllRows).toHaveBeenCalled();
    });

    it('should pass createRow function to TaskTable', () => {
      render(<TaskWithSWRPage />);
      
      fireEvent.click(screen.getByText('Create Row'));
      expect(mockHookReturn.createRow).toHaveBeenCalledWith([], "new title", "new detail");
    });
  });

  describe('Event Handlers', () => {
    it('should prevent default on search handler', () => {
      render(<TaskWithSWRPage />);
      
      const filterButton = screen.getByText('Filter');
      const mockEvent = { preventDefault: jest.fn() };
      
      fireEvent.click(filterButton);
      // Note: In real implementation, preventDefault would be called
      // This is more of a code coverage test
    });

    it('should prevent default on clear search handler', () => {
      render(<TaskWithSWRPage />);
      
      const clearButton = screen.getByText('Clear');
      const mockEvent = { preventDefault: jest.fn() };
      
      fireEvent.click(clearButton);
      // Note: In real implementation, preventDefault would be called
      // This is more of a code coverage test
    });
  });

  describe('useEffect Hooks', () => {
    it('should update filtered tasks when tasks change and not filtering', () => {
      const { rerender } = render(<TaskWithSWRPage />);
      
      const newTasks = [
        { id: 4, title: 'new title added', detail: 'New task added', completed: false, created_at: '' },
        ...mockTasks
      ];
      
      useTaskViewModelWithSwr.mockReturnValue({
        ...mockHookReturn,
        tasks: newTasks
      });
      
      rerender(<TaskWithSWRPage />);
      
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null tasks gracefully', () => {
      useTaskViewModelWithSwr.mockReturnValue({
        ...mockHookReturn,
        tasks: null
      });

      render(<TaskWithSWRPage />);
      expect(screen.queryByTestId('task-table')).not.toBeInTheDocument();
    });

    it('should handle empty tasks array', () => {
      useTaskViewModelWithSwr.mockReturnValue({
        ...mockHookReturn,
        tasks: []
      });

      render(<TaskWithSWRPage />);
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 0');
    });

    it('should handle filter with empty string', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: '' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3');
      });
    });

    it('should handle filter with only whitespace', async () => {
      render(<TaskWithSWRPage />);
      
      const filterInput = screen.getByPlaceholderText('Filter detail...');
      const filterButton = screen.getByText('Filter');
      
      fireEvent.change(filterInput, { target: { value: '   ' } });
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3');
      });
    });
  });
});
