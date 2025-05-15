import { renderHook, act } from '@testing-library/react';
import { useTaskViewModel } from './useTasksViewModel';
import { TaskModel } from '@/app/models/Task/use-client/TaskModel';
import { Task } from '@/app/types/Task';
import { DATA_FETCH_MODE } from "../../../../../feature-flags/tasksBff";

// Mock the entire TaskModel module
jest.mock('../../../models/Task/use-client/TaskModel');

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', detail: 'lorem ipsum', completed: false, created_at: '' },
  { id: 2, title: 'Task 2', detail: 'lorem ipsum', completed: true, created_at: '' },
];

describe('useTaskViewModel', () => {
  let mockGetTasksDBRows: jest.Mock;
  let mockDeleteAllRows: jest.Mock;
  let mockSeedTasksDB: jest.Mock;
  let spyConsoleError: jest.SpyInstance<any, any>;

  beforeEach(() => {
    // suppress console.error to reduce noise
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    // Create fresh mocks for each test
    mockGetTasksDBRows = jest.fn();
    mockDeleteAllRows = jest.fn();
    mockSeedTasksDB = jest.fn();

    // Mock TaskModel implementation
    (TaskModel as jest.Mock).mockImplementation(() => ({
      getTasksDBRows: mockGetTasksDBRows,
      deleteAllRows: mockDeleteAllRows,
      seedTasksDB: mockSeedTasksDB,
    }));
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
    jest.clearAllMocks();
  });

  it('should initialize with empty tasks and loading state', () => {
    mockGetTasksDBRows.mockResolvedValue([]);
    
    const { result } = renderHook(() => useTaskViewModel());
    
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  if (DATA_FETCH_MODE === "useEffect") {
    it('should load tasks on mount', async () => {
      mockGetTasksDBRows.mockResolvedValue(mockTasks);
      
      const { result } = renderHook(() => useTaskViewModel());
      
      // Initial state
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(true);
      
      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve(); // Let the useEffect complete
      });
      
      // After loading
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
      expect(mockGetTasksDBRows).toHaveBeenCalledTimes(1);
    });
  }

  if (DATA_FETCH_MODE === "useEffect") {
    it('should handle task loading error', async () => {
      mockGetTasksDBRows.mockRejectedValue(new Error('Loading failed'));
      
      const { result } = renderHook(() => useTaskViewModel());
      
      await act(async () => {
        await Promise.resolve();
      });
      
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  }

  it('should seed tasks database', async () => {
    mockGetTasksDBRows.mockResolvedValue([]);
    mockSeedTasksDB.mockResolvedValue(mockTasks);
    
    const { result } = renderHook(() => useTaskViewModel());
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });
    
    await act(async () => {
      await result.current.seedTasksDB();
    });
    
    expect(result.current.tasks).toEqual(mockTasks);
    expect(mockSeedTasksDB).toHaveBeenCalledTimes(1);
  });

  it('should delete all tasks', async () => {
    mockGetTasksDBRows.mockResolvedValue(mockTasks);
    mockDeleteAllRows.mockResolvedValue([]);
    
    const { result } = renderHook(() => useTaskViewModel());
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });
    
    await act(async () => {
      await result.current.deleteAllRows();
    });
    
    expect(result.current.tasks).toEqual([]);
    expect(mockDeleteAllRows).toHaveBeenCalledTimes(1);
  });

  it('should handle seed tasks error', async () => {
    mockGetTasksDBRows.mockResolvedValue([]);
    mockSeedTasksDB.mockRejectedValue(new Error('Seeding failed'));
    
    const { result } = renderHook(() => useTaskViewModel());
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });
    
    await act(async () => {
      await result.current.seedTasksDB();
    });
    
    // State shouldn't change on error
    expect(result.current.tasks).toEqual([]);
  });

  it('should handle delete all error', async () => {
    mockGetTasksDBRows.mockResolvedValue(mockTasks);
    mockDeleteAllRows.mockRejectedValue(new Error('Deletion failed'));
    
    const { result } = renderHook(() => useTaskViewModel());
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });
    
    await act(async () => {
      await result.current.deleteAllRows();
    });
    
    // On error, tasks should be set to empty array
    expect(result.current.tasks).toEqual([]);
  });
});