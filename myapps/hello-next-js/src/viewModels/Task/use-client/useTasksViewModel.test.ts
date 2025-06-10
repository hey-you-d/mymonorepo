import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskViewModel } from './useTasksViewModel';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import { Task } from '@/types/Task';

// Mock the entire TaskModel module
jest.mock('../../../models/Task/use-client/TaskModel');

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', detail: 'lorem ipsum', completed: false, created_at: '' },
  { id: 2, title: 'Task 2', detail: 'lorem ipsum', completed: true, created_at: '' },
];

describe('useTaskViewModel', () => {
  let mockTaskModel: any;
  let mockGetTasksDBRows: jest.Mock;
  let mockDeleteAllRows: jest.Mock;
  let mockSeedTasksDB: jest.Mock;
  let mockGetRowFromId: jest.Mock;
  let mockCreateRow: jest.Mock;
  let mockUpdateRowFromId: jest.Mock;
  let mockDeleteRowFromId: jest.Mock;
  let spyConsoleError: jest.SpyInstance<any, any>;

  // Sample task data for testing
  const mockTasks = [
    { id: 1, title: 'Task 1', detail: 'Detail 1', completed: false, created_at: "" },
    { id: 2, title: 'Task 2', detail: 'Detail 2', completed: true, created_at: "" },
  ];

  const mockTask = { id: 3, title: 'New Task', detail: 'New Detail', completed: false };

  beforeEach(() => {
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    
    // Create mock functions
    mockGetTasksDBRows = jest.fn();
    mockDeleteAllRows = jest.fn();
    mockSeedTasksDB = jest.fn();
    mockGetRowFromId = jest.fn();
    mockCreateRow = jest.fn();
    mockUpdateRowFromId = jest.fn();
    mockDeleteRowFromId = jest.fn();

    // Mock the TaskModel instance
    mockTaskModel = {
      getTasksDBRows: mockGetTasksDBRows,
      deleteAllRows: mockDeleteAllRows,
      seedTasksDB: mockSeedTasksDB,
      getRowFromId: mockGetRowFromId,
      createRow: mockCreateRow,
      updateRowFromId: mockUpdateRowFromId,
      deleteRowFromId: mockDeleteRowFromId,
    };

    // Mock the TaskModel constructor
    (TaskModel as jest.Mock).mockImplementation(() => mockTaskModel);
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Initial state and setup', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTaskViewModel());

      expect(result.current.tasks).toBeUndefined();
      expect(result.current.loading).toBe(true);
      expect(typeof result.current.seedTasksDB).toBe('function');
      expect(typeof result.current.deleteAllRows).toBe('function');
      expect(typeof result.current.createRow).toBe('function');
      expect(typeof result.current.getRowFromId).toBe('function');
      expect(typeof result.current.updateRowFromId).toBe('function');
      expect(typeof result.current.deleteRowFromId).toBe('function');
    });

    it('should create TaskModel instance only once', () => {
      const { rerender } = renderHook(() => useTaskViewModel());
      
      expect(TaskModel).toHaveBeenCalledTimes(1);
      
      rerender();
      
      expect(TaskModel).toHaveBeenCalledTimes(1);
    });

    it('should call getTasksDBRows on initial mount', async () => {
      (mockGetTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

      renderHook(() => useTaskViewModel());

      await waitFor(() => {
        expect(mockGetTasksDBRows).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getTasksDBRows', () => {
    it('should fetch tasks successfully', async () => {
      (mockGetTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      await waitFor(() => {
        expect(result.current.tasks).toEqual(mockTasks);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle fetch error', async () => {
      const autoFetchError = new Error('Initial auto-fetch failed'); // in useEffect 
      const manualCallError = new Error('Manual fetch failed');

      // First call: auto-fetch inside useEffect (will be ignored)
      // Second call: manual call to result.current.getTasksDBRows (what we’re testing)
      mockTaskModel.getTasksDBRows
        .mockRejectedValueOnce(autoFetchError)
        .mockRejectedValueOnce(manualCallError);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for the auto-fetch to complete (and fail silently)
      await waitFor(() => {
        expect(mockTaskModel.getTasksDBRows).toHaveBeenCalledTimes(1);
      });

      // Now test the manual call and error handling
      await act(async () => {
        await expect(result.current.getTasksDBRows()).rejects.toThrow('Manual fetch failed');
      });

      expect(mockTaskModel.getTasksDBRows).toHaveBeenCalledTimes(2);

      expect(console.error).toHaveBeenCalledWith(
        'useTasksViewModel | getTasksDBRows | Failed to fetch tasks db rows:',
        manualCallError
      );

      expect(result.current.loading).toBe(false);
    });
  });

  describe('deleteAllRows', () => {
    it('should delete all rows successfully', async () => {
      mockDeleteAllRows.mockResolvedValue([]);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteAllRows();
      });

      expect(mockDeleteAllRows).toHaveBeenCalledTimes(1);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle delete all rows error', async () => {
      const error = new Error('Delete failed');
      mockDeleteAllRows.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.deleteAllRows();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | deleteAllRows | Failed to delete tasks db rows:', error);
      expect(result.current.tasks).toEqual(mockTasks); // Tasks remain unchanged
      expect(result.current.loading).toBe(false);
    });
  });

  describe('seedTasksDB', () => {
    it('should seed database successfully', async () => {
      mockSeedTasksDB.mockResolvedValue(mockTasks);
      mockGetTasksDBRows.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.seedTasksDB();
      });

      expect(mockSeedTasksDB).toHaveBeenCalledTimes(1);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });

    it('should handle seed database error', async () => {
      const error = new Error('Seed failed');
      mockSeedTasksDB.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.seedTasksDB();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | seedTasksDB | Failed to seed tasks db:', error);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getRowFromId', () => {
    it('should get row by id successfully', async () => {
      mockGetRowFromId.mockResolvedValue([mockTask]);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.getRowFromId(3);
      });

      expect(mockGetRowFromId).toHaveBeenCalledWith(3);
      expect(result.current.tasks).toEqual([mockTask]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle get row by id error', async () => {
      const error = new Error('Get row failed');
      mockGetRowFromId.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.getRowFromId(3);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | getRowFromId | Failed to get row for id 3:', error);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });
  });  
  describe('createRow', () => {
    it('should create new row successfully', async () => {
      mockCreateRow.mockResolvedValue([mockTask]);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createRow(mockTasks, 'New Task', 'New Detail');
      });

      expect(mockCreateRow).toHaveBeenCalledWith('New Task', 'New Detail');
      expect(result.current.tasks).toEqual([mockTask, ...mockTasks]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle create row error', async () => {
      const error = new Error('Create failed');
      mockCreateRow.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.createRow(mockTasks, 'New Task', 'New Detail');
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | createRow | Failed to create a new row in the db: ', error);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('updateRowFromId', () => {
    it('should update row successfully', async () => {
      const updatedTask = { ...mockTasks[0], title: 'Updated Task', completed: true };
      mockUpdateRowFromId.mockResolvedValue(updatedTask);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateRowFromId(mockTasks, 1, 'Updated Task', 'Updated Detail', true);
      });

      expect(mockUpdateRowFromId).toHaveBeenCalledWith(1, 'Updated Task', 'Updated Detail', true);
      expect(result.current.tasks && result.current.tasks[0]).toEqual(updatedTask);
      expect(result.current.tasks && result.current.tasks[1]).toEqual(mockTasks[1]); // Other tasks unchanged
      expect(result.current.loading).toBe(false);
    });

    it('should handle update row error', async () => {
      const error = new Error('Update failed');
      mockUpdateRowFromId.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.updateRowFromId(mockTasks, 1, 'Updated Task', 'Updated Detail', true);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | updateRowFromId | Failed to update row for id 1:', error);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('deleteRowFromId', () => {
    it('should delete row successfully', async () => {
      mockDeleteRowFromId.mockResolvedValue([]);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteRowFromId(1);
      });

      expect(mockDeleteRowFromId).toHaveBeenCalledWith(1);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle delete row error', async () => {
      const error = new Error('Delete failed');
      mockDeleteRowFromId.mockRejectedValue(error);
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.deleteRowFromId(1);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(spyConsoleError).toHaveBeenCalledWith('useTasksViewModel | getTasksDBRows | Failed to delete row for id 1:', error);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });
  });
  describe('Loading states', () => {
    it('should set loading to true during async operations', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockSeedTasksDB.mockReturnValue(promise);
      mockGetTasksDBRows.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.seedTasksDB();
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        resolvePromise!(mockTasks);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
  describe('useEffect behavior', () => {
    it('should not call getTasksDBRows if tasks are already loaded', async () => {
      mockGetTasksDBRows.mockResolvedValue(mockTasks);

      const { result, rerender } = renderHook(() => useTaskViewModel());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.tasks).toEqual(mockTasks);
      });

      // Clear the mock call count
      mockGetTasksDBRows.mockClear();

      // Rerender should not trigger another API call
      rerender();

      // Give it a moment to potentially make another call
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockGetTasksDBRows).not.toHaveBeenCalled();
    });
  });
});  
