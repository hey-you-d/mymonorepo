import { Task } from  "@/types/Task";
import { APP_ENV } from "@/lib/app/featureFlags";

const mockApiHeader = {
  'Content-Type': 'application/json',
  'x-api-key': 'dummy-test-key',
  'Authorization': 'Bearer valid-jwt',
};

// Define mock response type
type MockResponse = {
  ok: boolean;
  json: jest.Mock<Promise<any>>;
  status: number;
  statusText: string;
};

// Dynamically import AFTER mocks are in place
let getTasksDBRows: typeof import('./TaskModel').getTasksDBRows;
let deleteAllRows: typeof import('./TaskModel').deleteAllRows;
let seedTasksDB: typeof import('./TaskModel').seedTasksDB;
let getRowFromId: typeof import('./TaskModel').getRowFromId;
let createRow: typeof import('./TaskModel').createRow;
let updateRowFromId: typeof import('./TaskModel').updateRowFromId;
let deleteRowFromId: typeof import('./TaskModel').deleteRowFromId;

describe('TaskModel', () => {  
  let url: string = "";
  
  let spyConsoleError: jest.SpyInstance<any, any>;

  // Helper function to create mock responses
  const mockResponse = (ok: boolean, data: any): MockResponse => ({
    ok,
    json: jest.fn().mockResolvedValue(data),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error'
  });
  
  beforeAll(async () => {
    jest.resetModules(); // clear cached modules to allow mocking

    // Must go before any imports
    jest.doMock('../../../lib/app/common', () => ({
      TASKS_API_HEADER: jest.fn().mockResolvedValue(mockApiHeader),
      TASKS_SQL_DOMAIN_API_URL: 'https://api.example.com/api/tasks/v1/sql',
      TASKS_SQL_BASE_API_URL: 'https://api.example.com/hello-next-js/api/tasks/v1/sql',
    }));

    // mock the http only auth_token cookie. 
    // The presence of this cookie indicates that the user has logged in
    jest.doMock('next/headers', () => ({
      cookies: jest.fn(() => ({
        get: (name: string) => {
          if (name === 'auth_token') {
            return { value: 'mocked-token' };
          }
          return undefined;
        },
      })),
    }));

    // Re-import AFTER mocks are in place
    getTasksDBRows = (await import('./TaskModel')).getTasksDBRows;
    deleteAllRows = (await import('./TaskModel')).deleteAllRows;
    seedTasksDB = (await import('./TaskModel')).seedTasksDB;
    getRowFromId = (await import('./TaskModel')).getRowFromId;
    createRow = (await import('./TaskModel')).createRow;
    updateRowFromId = (await import('./TaskModel')).updateRowFromId;
    deleteRowFromId = (await import('./TaskModel')).deleteRowFromId;

    global.fetch = jest.fn();

    url = APP_ENV === "LIVE" ? "https://mock-base-url.com" : "";
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

    //taskModel = new TaskModel();
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getTasksDBRows', () => {
    it('should fetch tasks successfully', async () => {
      const mockData = [{ id: 1, task: 'Test task' }];
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await getTasksDBRows();

      // Check TASKS_API_HEADER was called
      const { TASKS_API_HEADER } = await import('../../../lib/app/common');
      expect(TASKS_API_HEADER).toHaveBeenCalled();

      expect(result).toEqual(mockData);

      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/", {
        method: 'GET',
        headers: mockApiHeader
      });
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Server error' }));

      await expect(getTasksDBRows()).rejects.toThrow("use-server | model | TaskModel | getTasksDBRows | catched error: Error - use-server | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getTasksDBRows()).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAllRows', () => {
    it('should delete all rows successfully', async () => {
      const mockData = { message: 'All rows deleted' };
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await deleteAllRows();

      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/delete-rows", {
        method: 'POST',
        headers: mockApiHeader
      });
      expect(result).toEqual(mockData);
    });

    it('should handle delete error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Delete failed' }));

      await expect(getTasksDBRows()).rejects.toThrow("use-server | model | TaskModel | getTasksDBRows | catched error: Error - use-server | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedTasksDB', () => {
    it('should seed database successfully', async () => {
      const mockData = { rows: [{ id: 1, task: 'Seeded task' }] };
      (fetch as jest.Mock).mockResolvedValue(mockResponse(true, mockData));

      const result = await seedTasksDB();

      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/seed-table", {
        method: 'POST',
        headers: mockApiHeader
      });
      expect(result).toEqual(mockData.rows);
    });

    it('should handle seed error', async () => {
      (fetch as jest.Mock).mockResolvedValue(mockResponse(false, { error: 'Seed failed' }));

      await expect(getTasksDBRows()).rejects.toThrow("use-server | model | TaskModel | getTasksDBRows | catched error: Error - use-server | model | TaskModel | getTasksDBRows | not ok response: 500 - Internal Server Error ");
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

      const result = await getRowFromId(1);

      // Check TASKS_API_HEADER was called
      const { TASKS_API_HEADER } = await import('../../../lib/app/common');
      expect(TASKS_API_HEADER).toHaveBeenCalled();

      expect(result).toEqual({rows: mockData});
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/1", {
        method: 'GET',
        headers: mockApiHeader
      });
    });

    it('should return null on non-OK 404 response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found'),
      };
  
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
  
      // for reference: 404 shouldn't throw an error 
      //await expect(getRowFromId(999)).rejects.toThrow('Error fetching row: 404');
      await expect(getRowFromId(999)).resolves.toEqual(null);
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(getRowFromId(2)).rejects.toThrow('Network error');
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

      const result = await createRow('test', 'test');
      expect(result).toEqual(mockData); // the fn returns the newly created row
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/create-row", {
        method: 'POST',
        headers: mockApiHeader,
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
  
      await expect(createRow('test', 'test')).rejects.toThrow('use-server | model | TaskModel | createRow | catched error: Error - use-server | model | TaskModel | createRow | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(createRow('test', 'test')).rejects.toThrow('Network error');
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

      const result = await updateRowFromId(999, 'test', 'test', true);
      expect(result).toEqual({ rows: mockData }); // the fn returns the updated row
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/999", {
        method: 'PUT',
        headers: mockApiHeader,
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
  
      await expect(updateRowFromId(999, 'test', 'test', false)).rejects.toThrow('use-server | model | TaskModel | updateRowFromId | catched error: Error - use-server | model | TaskModel | updateRowFromId | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(updateRowFromId(999, 'test', 'test', false)).rejects.toThrow('Network error');
    });
  });

  describe('deleteRowFromId', () => {
    it('should delete an existing row successfully', async () => {
      const mockData: Task[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ rows: mockData }),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteRowFromId(999);
      expect(result).toEqual(mockData); // the fn returns the deleted row
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/hello-next-js/api/tasks/v1/sql/999", {
        method: 'DELETE',
        headers: mockApiHeader
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
  
      await expect(deleteRowFromId(999)).rejects.toThrow('use-server | model | TaskModel | deleteRowFromId | catched error: Error - use-server | model | TaskModel | deleteRowFromId | not ok response: 404 - Not Found ');
    });

    it('should throw error on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
      await expect(deleteRowFromId(2)).rejects.toThrow('Network error');
    });
  });
});
