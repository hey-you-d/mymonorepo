import { TaskModel } from './TaskModel';

// Define mock response type
type MockResponse = {
  ok: boolean;
  json: jest.Mock<Promise<any>>;
  status: number;
  statusText: string;
};

describe('TaskModel', () => {
  let taskModel: TaskModel;
  
  // Helper function to create mock responses
  const mockResponse = (ok: boolean, data: any): MockResponse => ({
    ok,
    json: jest.fn().mockResolvedValue(data),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error'
  });

  beforeEach(() => {
    taskModel = new TaskModel();
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasksDBRows', () => {
    it('should fetch tasks successfully', async () => {
      const mockData = [{ id: 1, task: 'Test task' }];
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await taskModel.getTasksDBRows();

      expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      expect(result).toEqual(mockData);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Server error' }));

      //await expect(taskModel.getTasksDBRows()).rejects.toThrow();
      await expect(taskModel.getTasksDBRows()).resolves.toEqual({"error": "Server error"});
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(taskModel.getTasksDBRows()).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAllRows', () => {
    it('should delete all rows successfully', async () => {
      const mockData = { message: 'All rows deleted' };
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await taskModel.deleteAllRows();

      expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/delete-rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      expect(result).toEqual(mockData);
    });

    it('should handle delete error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Delete failed' }));

      //await expect(taskModel.deleteAllRows()).rejects.toThrow();
      await expect(taskModel.getTasksDBRows()).resolves.toEqual({"error": "Delete failed"});
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedTasksDB', () => {
    it('should seed database successfully', async () => {
      const mockData = { rows: [{ id: 1, task: 'Seeded task' }] };
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await taskModel.seedTasksDB();

      expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/seed-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      expect(result).toEqual(mockData.rows);
    });

    it('should handle seed error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Seed failed' }));

      //await expect(taskModel.seedTasksDB()).rejects.toThrow();
      await expect(taskModel.getTasksDBRows()).resolves.toEqual({"error": "Seed failed"});
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
