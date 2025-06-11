// for reference: mocked next/cache to address the following error: 
// Invariant: static generation store missing in revalidateTag tasks-api-swr-tag
jest.mock('next/cache');

jest.mock('../../../models/Task/use-server/TaskModel', () => ({
    swrFetcher: jest.fn(),
    getTasksDBRows: jest.fn(),
    deleteAllRows: jest.fn(),
    seedTasksDB: jest.fn(),
    createRow: jest.fn(),
    getRowFromId: jest.fn(),
    deleteRowFromId: jest.fn(),
    updateRowFromId: jest.fn(),
}));

import {
  fetcher,
  getTasksDBRows as getTasksDBRowsVM,
  deleteAllRows as deleteAllRowsVM,
  seedTasksDB as seedTasksDBVM,
  getRowFromId as getRowFromIdVM,
  createRow as createRowVM,
  updateRowFromId as updateRowFromIdVM,
  deleteRowFromId as deleteRowFromIdVM
} from './getTasksViewModelWithSwr';
import {
  swrFetcher,
  getTasksDBRows as getTasksDBRowsModel,
  deleteAllRows as deleteAllRowsModel,
  seedTasksDB as seedTasksDBModel,
  getRowFromId as getRowFromIdModel,
  createRow as createRowModel,
  updateRowFromId as updateRowFromIdModel,
  deleteRowFromId as deleteRowFromIdModel
} from '@/models/Task/use-server/TaskModel';
import { revalidateTag as mockRevalidateTag } from 'next/cache';
import type { Task } from '@/types/Task';
import { BASE_URL } from '@/lib/app/common';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  detail: 'Test Detail',
  completed: false,
  created_at: new Date().toISOString(),
};

let spyConsoleError: jest.SpyInstance<any, any>;

describe('getTasksViewModelWithSwr', () => {
  beforeEach(() => {
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  describe('fetcher', () => {
    it('should return tasks from swrFetcher', async () => {
      (swrFetcher as jest.Mock).mockResolvedValue([mockTask]);
      
      const result = await fetcher();
      
      expect(swrFetcher).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });

    it('should throw error when swrFetcher fails', async () => {
      const error = new Error('Fetch failed');
      (swrFetcher as jest.Mock).mockRejectedValue(error);
      
      await expect(fetcher()).rejects.toThrow(error);
    });
  });
  describe('getTasksDBRows', () => {
    it('should fetch tasks and revalidate cache', async () => {
      (getTasksDBRowsModel as jest.Mock).mockResolvedValue([mockTask]);
      
      const result = await getTasksDBRowsVM();
      
      expect(getTasksDBRowsModel).toHaveBeenCalledWith(`${BASE_URL}/api/tasks/v1/sql`);
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
      expect(result).toEqual({ tasks: [mockTask] });
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Fetch failed');
      (getTasksDBRowsModel as jest.Mock).mockRejectedValue(error);
      
      await expect(getTasksDBRowsVM()).rejects.toThrow(error);
    });
  });
  describe('deleteAllRows', () => {
    it('should delete all rows and revalidate cache', async () => {
      await deleteAllRowsVM();
      
      expect(deleteAllRowsModel).toHaveBeenCalledWith(`${BASE_URL}/api/tasks/v1/sql`);
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      (deleteAllRowsModel as jest.Mock).mockRejectedValue(error);
      
      await expect(deleteAllRowsVM()).rejects.toThrow(error);
    });
  });
  describe('seedTasksDB', () => {
    it('should seed database and revalidate cache', async () => {
      await seedTasksDBVM();
      
      expect(seedTasksDBModel).toHaveBeenCalledWith(`${BASE_URL}/api/tasks/v1/sql`);
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
    });

    it('should throw error when seeding fails', async () => {
      const error = new Error('Seeding failed');
      (seedTasksDBModel as jest.Mock).mockRejectedValue(error);
      
      await expect(seedTasksDBVM()).rejects.toThrow(error);
    });
  });
  describe('getRowFromId', () => {
    it('should fetch task by id and revalidate cache', async () => {
      (getRowFromIdModel as jest.Mock).mockResolvedValue(mockTask);
      
      const result = await getRowFromIdVM(1);
      
      expect(getRowFromIdModel).toHaveBeenCalledWith(1, `${BASE_URL}/api/tasks/v1/sql`);
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
      expect(result).toEqual({ task: mockTask });
    });

    it('should return null when task not found', async () => {
      (getRowFromIdModel as jest.Mock).mockResolvedValue(null);
      
      const result = await getRowFromIdVM(999);
      
      expect(result).toEqual({ task: null });
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Fetch failed');
      (getRowFromIdModel as jest.Mock).mockRejectedValue(error);
      
      await expect(getRowFromIdVM(1)).rejects.toThrow(error);
    });
  });
  describe('createRow', () => {
    it('should create a new task and revalidate cache', async () => {
      await createRowVM('New Task', 'New Detail');
      
      expect(createRowModel).toHaveBeenCalledWith(
        'New Task', 
        'New Detail', 
        `${BASE_URL}/api/tasks/v1/sql`
      );
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
    });

    it('should throw error when creation fails', async () => {
      const error = new Error('Creation failed');
      (createRowModel as jest.Mock).mockRejectedValue(error);
      
      await expect(createRowVM('New Task', 'New Detail')).rejects.toThrow(error);
    });
  });
  describe('updateRowFromId', () => {
    it('should update task and revalidate cache', async () => {
      await updateRowFromIdVM(1, 'Updated Task', 'Updated Detail', true);
      
      expect(updateRowFromIdModel).toHaveBeenCalledWith(
        1, 
        'Updated Task', 
        'Updated Detail', 
        true,
        `${BASE_URL}/api/tasks/v1/sql`
      );
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      (updateRowFromIdModel as jest.Mock).mockRejectedValue(error);
      
      await expect(updateRowFromIdVM(1, 'Updated Task', 'Updated Detail', true))
        .rejects.toThrow(error);
    });
  });
  describe('deleteRowFromId', () => {
    it('should delete task and revalidate cache', async () => {
      const result = await deleteRowFromIdVM(1);
      
      expect(deleteRowFromIdModel).toHaveBeenCalledWith(
        1,
        `${BASE_URL}/api/tasks/v1/sql`
      );
      expect(mockRevalidateTag).toHaveBeenCalledWith('tasks-api-swr-tag');
      expect(result).toEqual({ tasks: null });
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      (deleteRowFromIdModel as jest.Mock).mockRejectedValue(error);
      
      await expect(deleteRowFromIdVM(1)).rejects.toThrow(error);
    });
  });
});
  