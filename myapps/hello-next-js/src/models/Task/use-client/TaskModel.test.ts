import { TaskModel } from './TaskModel';
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";

// Define mock response type
type MockResponse = {
  ok: boolean;
  json: jest.Mock<Promise<any>>;
  status: number;
  statusText: string;
};

describe('TaskModel', () => {
  let taskModel: TaskModel;
  let spyConsoleError: jest.SpyInstance<any, any>;
  
  // Helper function to create mock responses
  const mockResponse = (ok: boolean, data: any): MockResponse => ({
    ok,
    json: jest.fn().mockResolvedValue(data),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

    taskModel = new TaskModel();
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getTasksDBRows', () => {
    it('should fetch tasks successfully', async () => {
      const mockData = [{ id: 1, task: 'Test task' }];
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await taskModel.getTasksDBRows();

      expect(fetch).toHaveBeenCalledWith(TASKS_BFF_BASE_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      expect(result).toEqual(mockData);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Server error' }));

      await expect(taskModel.getTasksDBRows()).rejects.toThrow("use-client | model | TaskModel | getTasksDBRows | catched error: Error - use-client | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
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

      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/delete-rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
      });
      expect(result).toEqual(mockData);
    });

    it('should handle delete error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Delete failed' }));

      await expect(taskModel.getTasksDBRows()).rejects.toThrow("use-client | model | TaskModel | getTasksDBRows | catched error: Error - use-client | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedTasksDB', () => {
    it('should seed database successfully', async () => {
      const mockData = { rows: [{ id: 1, task: 'Seeded task' }] };
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await taskModel.seedTasksDB();

      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/seed-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
      });
      expect(result).toEqual(mockData.rows);
    });

    it('should handle seed error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Seed failed' }));

      await expect(taskModel.getTasksDBRows()).rejects.toThrow("use-client | model | TaskModel | getTasksDBRows | catched error: Error - use-client | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRowFromId', () => {
    it('should get a single row successfully', async () => {
      const mockData = [{ id: 1, name: 'Test task' }];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ rows: mockData }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskModel.getRowFromId(1);
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/1`,  {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
      });
    });

    it('should throw error on non-OK response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found'),
      };
  
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
  
      await expect(taskModel.getRowFromId(999)).rejects.toThrow('use-client | model | TaskModel | getRowFromId | catched error: Error - use-client | model | TaskModel | getRowFromId | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(taskModel.getRowFromId(2)).rejects.toThrow('Network error');
    });
  });

  describe('createRow', () => {
    it('should create a new row successfully', async () => {
      const mockData = [{ id: 1, name: 'Test task' }];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ rows: mockData }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskModel.createRow('test', 'test');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/create-row`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        body: "{\"title\":\"test\",\"detail\":\"test\"}"
      });
    });

    it('should throw error on non-OK response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found'),
      };
  
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
  
      await expect(taskModel.createRow('test', 'test')).rejects.toThrow('use-client | model | TaskModel | createRow | catched error: Error - use-client | model | TaskModel | createRow | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(taskModel.createRow('test', 'test')).rejects.toThrow('Network error');
    });
  });

  describe('updateRowFromId', () => {
    it('should update an existing row successfully', async () => {
      const mockData = [{ id: 1, name: 'Test task' }];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ rows: mockData }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskModel.updateRowFromId(999, 'test', 'test', true);
      expect(result).toEqual({"rows": [{"id": 1, "name": "Test task"}]});
      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/999`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        body: "{\"title\":\"test\",\"detail\":\"test\",\"completed\":true}"
      });
    });

    it('should throw error on non-OK response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found'),
      };
  
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
  
      await expect(taskModel.updateRowFromId(999, 'test', 'test', false)).rejects.toThrow('use-client | model | TaskModel | updateRowFromId | catched error: Error - use-client | model | TaskModel | updateRowFromId | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(taskModel.updateRowFromId(999, 'test', 'test', false)).rejects.toThrow('Network error');
    });
  });

  describe('deleteRowFromId', () => {
    it('should delete an existing row successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ rows: [] }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskModel.deleteRowFromId(999);
      expect(result).toEqual(undefined); // the fn is a void function
      expect(fetch).toHaveBeenCalledWith(`${TASKS_BFF_BASE_API_URL}/999`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
      });
    });

    it('should throw error on non-OK response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found'),
      };
  
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
  
      await expect(taskModel.deleteRowFromId(999)).rejects.toThrow('use-client | model | TaskModel | deleteRowFromId | catched error: Error - use-client | model | TaskModel | deleteRowFromId | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(taskModel.deleteRowFromId(2)).rejects.toThrow('Network error');
    });
  });
});
