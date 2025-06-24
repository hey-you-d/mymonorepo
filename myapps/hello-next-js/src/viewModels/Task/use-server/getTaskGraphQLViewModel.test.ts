import {
  getTasksDBRows as getTasksDBRowsVM,
  deleteAllRows as deleteAllRowsVM,
  seedTaskDB as seedTaskDBVM,
  createRow as createRowVM,
  updateRowFromId as updateRowFromIdVM,
} from './getTaskGraphQLViewModel';

import { fetchGraphQL } from '@/models/Task/use-server/TaskGraphqlClient';
// Mock the fetchGraphQL module
jest.mock('../../../models/Task/use-server/TaskGraphqlClient');

import type { Task } from '@/types/Task';

const mockTasks: Task[] = [
    {
        id: 1,
        title: 'Test Task 1',
        detail: 'Detail 1',
        completed: false,
        created_at: '2023-01-01',
    },
    {
        id: 2,
        title: 'Test Task 2',
        detail: 'Detail 2',
        completed: true,
        created_at: '2023-01-02',
    },
];

const mockNewTask: Task = {
    id: 3,
    title: 'New Task',
    detail: 'New Detail',
    completed: false,
    created_at: '2023-01-03',
};

const mockUpdatedTask: Task = {
    ...mockTasks[0],
    title: 'Updated Title',
    detail: 'Updated Detail',
    completed: true,
};

let spyConsoleError: jest.SpyInstance<any, any>;

describe('getTaskGraphQLViewModel', () => {
  beforeAll(() => {
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
  });
  beforeEach(() => {
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  describe('getTasksDBRows', () => {
    it('should fetch and return tasks', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValueOnce({ tasks: mockTasks });

      const result = await getTasksDBRowsVM();

      expect(fetchGraphQL).toHaveBeenCalledWith(expect.stringContaining('query'));
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error when fetching fails', async () => {
      const error = new Error('Fetch failed');
      (fetchGraphQL as jest.Mock).mockRejectedValueOnce(error);

      await expect(getTasksDBRowsVM()).rejects.toThrow("use-server | view-model | getTaskGraphQLViewModel | getTasksDBRows | catched error: Error - Fetch failed");
    });
  });
  describe('createRow', () => {
    it('should create a new task and return it', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValueOnce({ createTask: mockNewTask });

      const result = await createRowVM([], 'New Task', 'New Detail');

      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('mutation CreateTask'),
        { title: 'New Task', detail: 'New Detail' }
      );
      expect(result).toEqual(mockNewTask);
    });

    it('should throw an error when creation fails', async () => {
      const error = new Error('Creation failed');
      (fetchGraphQL as jest.Mock).mockRejectedValueOnce(error);

      await expect(createRowVM([], 'New Task', 'New Detail')).rejects.toThrow("use-server | view-model | getTaskGraphQLViewModel | createRow | catched error: Error - Creation failed");
    });
  });
  describe('deleteAllRows', () => {
    it('should delete all tasks and return empty array', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValueOnce({});

      const result = await deleteAllRowsVM();

      expect(fetchGraphQL).toHaveBeenCalledWith(expect.stringContaining('mutation DeleteTasks'));
      expect(result).toEqual([]);
    });

    it('should throw an error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      (fetchGraphQL as jest.Mock).mockRejectedValueOnce(error);

      await expect(deleteAllRowsVM()).rejects.toThrow("use-server | view-model | getTaskGraphQLViewModel | deleteAllRows | catched error: Error - Deletion failed");
    });
  });
  describe('seedTaskDB', () => {
    it('should seed the database and return the seeded tasks', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValueOnce({ seedTasks: mockTasks });

      const result = await seedTaskDBVM();

      expect(fetchGraphQL).toHaveBeenCalledWith(expect.stringContaining('mutation SeedTasks'));
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error when seeding fails', async () => {
      const error = new Error('Seeding failed');
      (fetchGraphQL as jest.Mock).mockRejectedValueOnce(error);

      await expect(seedTaskDBVM()).rejects.toThrow("use-server | view-model | getTaskGraphQLViewModel | seedTaskDB | catched error: Error - Seeding failed");
    });
  });
  describe('updateRowFromId', () => {
    it('should update a task and return the updated task', async () => {
      (fetchGraphQL as jest.Mock).mockResolvedValueOnce({ updateTask: mockUpdatedTask });

      const result = await updateRowFromIdVM(
        mockTasks,
        1,
        'Updated Title',
        'Updated Detail',
        true
      );

      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('mutation UpdateTask'),
        {
          id: 1,
          title: 'Updated Title',
          detail: 'Updated Detail',
          completed: true,
        }
      );
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw an error when update fails', async () => {
      const error = new Error('Update failed');
      (fetchGraphQL as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        updateRowFromIdVM(mockTasks, 1, 'Updated', 'Detail', true)
      ).rejects.toThrow("use-server | view-model | getTaskGraphQLViewModel | updateRowFromId [id: 1] | catched error: Error - Update failed");
    });
  });
});
  