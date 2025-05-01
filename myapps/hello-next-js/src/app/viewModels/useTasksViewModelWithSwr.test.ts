import { renderHook, act } from '@testing-library/react';
import { useTaskViewModelWithSwr } from './useTasksViewModelWithSwr';
import { TaskModel } from '../models/TaskModel';
import { Task } from '../types/Task';

// Mock the entire TaskModel module
jest.mock('../models/TaskModel');

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', detail: 'lorem ipsum', completed: false, created_at: '' },
  { id: 2, title: 'Task 2', detail: 'lorem ipsum', completed: true, created_at: '' },
];

describe('useTaskViewModelWithSwr', () => {
  let mockGetTasksDBRows: jest.Mock;
  let mockDeleteAllRows: jest.Mock;
  let mockSeedTasksDB: jest.Mock;
  let spyConsoleError: jest.SpyInstance<any, any>;

  beforeEach(() => {
    // suppress console.error to reduce noise
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

    // Create fresh mocks for each test
    mockGetTasksDBRows = jest.fn().mockResolvedValue(mockTasks);
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

  it('should initialize with undefined tasks and false loading state', () => {
    // not []. 
    // tasks comes from useSWR, which is asynchronous and cache-driven instead of directly returned 
    // by TaskModel fn, and won’t update immediately after rendering the hook — 
    // especially when you’re using renderHook in a unit test and not triggering a real HTTP request.
    mockGetTasksDBRows.mockResolvedValue([]);
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
    expect(result.current.tasks).toBeUndefined;
    expect(result.current.loading).toBe(true);
  });

  it('should load tasks on mount', async () => {
    mockGetTasksDBRows.mockResolvedValue(mockTasks);
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
    // Initial state
    expect(result.current.tasks).toBeUndefined; 
    expect(result.current.loading).toBe(false); // because getTasksDBRows() is called within useEffect to populate the table after init page load 
    
    // Wait for useEffect to complete
    await act(async () => {
      await Promise.resolve(); // Let the useEffect complete
    });
    
    // After loading
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.loading).toBe(false);
    expect(mockGetTasksDBRows).toHaveBeenCalledTimes(1);
  });

  it('should seed tasks database', async () => {
    mockGetTasksDBRows.mockResolvedValue([]);
    mockSeedTasksDB.mockResolvedValue(mockTasks);
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
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
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
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
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
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
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });
    
    await act(async () => {
      await result.current.deleteAllRows();
    });
    
    // On error, tasks should be set to empty array
    // because of calling mutate("Tasks-API", [], false); // Explicitly clear cache 
    // in the catch(error) condition
    expect(result.current.tasks).toEqual([]);
  });

  it('should handle task loading error', async () => {
    mockGetTasksDBRows.mockRejectedValue(new Error('Loading failed'));
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());
    
    await act(async () => {
      await Promise.resolve();
    });
    
    // On error, tasks should be set to empty array
    // because of calling mutate("Tasks-API", [], false); // Explicitly clear cache 
    // in the catch(error) condition
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
