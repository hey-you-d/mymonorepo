import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useTaskViewModelWithSwr } from './useTasksViewModelWithSwr';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import type { Task } from '@/types/Task';

// Mock the entire TaskModel module
jest.mock('../../../models/Task/use-client/TaskModel');

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', detail: 'lorem ipsum', completed: false, created_at: '' },
  { id: 2, title: 'Task 2', detail: 'lorem ipsum', completed: true, created_at: '' },
];

// Mocked fallback data (as if it came from getServerSideProps)
const fallbackData = {
  'Tasks-API': mockTasks,
};

describe('useTaskViewModelWithSwr', () => {
  let mockGetTasksDBRows: jest.Mock;
  let mockDeleteAllRows: jest.Mock;
  let mockSeedTasksDB: jest.Mock;
  let spyConsoleError: jest.SpyInstance<any, any>;

  beforeEach(() => {
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

    // Create fresh mocks for each test
    mockGetTasksDBRows = jest.fn().mockResolvedValue(mockTasks);
    mockDeleteAllRows = jest.fn(); // or jest.fn().mockResolvedValue(undefined);
    mockSeedTasksDB = jest.fn(); 

    // Mock TaskModel implementation
    (TaskModel as jest.Mock).mockImplementation(() => ({
      getTasksDBRows: mockGetTasksDBRows,
      deleteAllRows: mockDeleteAllRows,
      seedTasksDB: mockSeedTasksDB,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();  // clears calls but NOT implementations
    mockGetTasksDBRows.mockReset(); // resets implementation & calls
    mockDeleteAllRows.mockReset();
    mockSeedTasksDB.mockReset();
  });

  it('should load tasks from fallback data (as in getServerSideProps)', async () => {
    mockGetTasksDBRows.mockResolvedValue(mockTasks);
    const { result } = renderHook(() => useTaskViewModelWithSwr(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ fallback: fallbackData, dedupingInterval: 0 }}>
          {children}
        </SWRConfig>
      )  
    });
  
    // because SWR is detecting a fallback, so it skips calling the fetcher
    expect(mockGetTasksDBRows).not.toHaveBeenCalled(); 
    expect(result.current.loading).toBe(true);

    // Wait for SWR to hydrate fallback data into hook state
    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });

    // Wait for revalidation to trigger fetcher call
    await waitFor(() => {
      // because in the fetcher fn, we call swrFetcher(); instead of calling taskModel.getTasksDBRows();
      expect(mockGetTasksDBRows).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    // loading should be false after fetch
    expect(result.current.loading).toBe(false);
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
  
    // Expect the function to throw an error
    await act(async () => {
      await expect(result.current.seedTasksDB()).rejects.toThrow('Seeding failed');
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
    
    // Expect the function to throw an error
    await act(async () => {
      await expect(result.current.deleteAllRows()).rejects.toThrow('Deletion failed');
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

  it('should initialize with undefined tasks and false loading state', async () => {
    // not []. 
    // tasks comes from useSWR, which is asynchronous and cache-driven instead of directly returned 
    // by TaskModel fn, and won’t update immediately after rendering the hook — 
    // especially when you’re using renderHook in a unit test and not triggering a real HTTP request.
    mockGetTasksDBRows.mockResolvedValue([]);
    
    const { result } = renderHook(() => useTaskViewModelWithSwr());

    expect(result.current.tasks).toBeUndefined;
    expect(result.current.loading).toBe(false);
  });
});
