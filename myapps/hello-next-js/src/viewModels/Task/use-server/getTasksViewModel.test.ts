import * as TaskModel from '../../../models/Task/use-server/TaskModel';
import type { Task } from '@/types/Task';
import { BASE_URL } from '@/lib/app/common';

jest.mock('../../../models/Task/use-server/TaskModel', () => ({
    getTasksDBRows: jest.fn(),
    deleteAllRows: jest.fn(),
    seedTasksDB: jest.fn(),
    createRow: jest.fn(),
    getRowFromId: jest.fn(),
    deleteRowFromId: jest.fn(),
    updateRowFromId: jest.fn(),
}));

import { 
    getTasksDBRows,
    deleteAllRows, 
    seedTasksDB,
    createRow,
    getRowFromId,
    deleteRowFromId,
    updateRowFromId,
} from './getTasksViewModel';

describe('getTaskViewModel', () => {
    const mockTasks: Task[] = [
        { id: 1, title: 'Test Task 1', detail: 'Task 1 detail', completed: false, created_at: "" },
        { id: 2, title: 'Test Task 2', detail: 'Task 2 detail', completed: true, created_at: "" },
    ];

    let spyConsoleError: jest.SpyInstance<any, any>;

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
        jest.resetAllMocks();
        
        spyConsoleError.mockRestore();
    });

    it('[getTasksDBRows] - should return tasks from TaskModel', async () => {
        // arrange
        (TaskModel.getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

        // act
        const result = await getTasksDBRows();

        // assert
        expect(TaskModel.getTasksDBRows).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tasks: mockTasks });
    });

    it('[getTasksDBRows] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.getTasksDBRows as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(getTasksDBRows()).rejects.toThrow("use-server | view-model | getTasksViewModel | getTasksDBRows | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.getTasksDBRows).toHaveBeenCalledTimes(1);
    });

    it('[deleteAllRows] - should return an empty Task array from TaskModel', async () => {
        // arrange
        (TaskModel.deleteAllRows as jest.Mock).mockResolvedValue([]);

        // act
        const result = await deleteAllRows();

        // assert
        expect(TaskModel.deleteAllRows).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tasks: [] });
    });

    it('[deleteAllRows] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.deleteAllRows as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(deleteAllRows()).rejects.toThrow("use-server | view-model | getTasksViewModel | deleteAllRows | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.deleteAllRows).toHaveBeenCalledTimes(1);
    });

    it('[seedTaskDB] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.seedTasksDB as jest.Mock).mockResolvedValue(mockTasks);

        // act
        const result = await seedTasksDB();

        // assert
        expect(TaskModel.seedTasksDB).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ tasks: mockTasks });
    });

    it('[seedTaskDB] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.seedTasksDB as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(seedTasksDB()).rejects.toThrow("use-server | view-model | getTasksViewModel | seedTasksDB | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.seedTasksDB).toHaveBeenCalledTimes(1);
    });

    it('[createRow] - should return an mockdata from TaskModel', async () => {
        // arrange
        const newRow: Task = { id: 3, title: "new title", detail: "new detail", completed: false, created_at: "" };
        (TaskModel.createRow as jest.Mock).mockResolvedValue([newRow]);
        
        // act
        const result = await createRow(mockTasks, newRow.title, newRow.detail);

        // assert
        expect(TaskModel.createRow).toHaveBeenCalledTimes(1);
        expect(TaskModel.createRow).toHaveBeenCalledWith("new title", "new detail", `${BASE_URL}/api/tasks/v1/sql`);
        const updatedMockTasksDescOrder = [...mockTasks, newRow].sort((a, b) => b.id - a.id);
        expect(result).toEqual({ tasks: updatedMockTasksDescOrder });
    });

    it('[createRow] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.createRow as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(createRow).rejects.toThrow("use-server | view-model | getTasksViewModel | createRow | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.createRow).toHaveBeenCalledTimes(1);
    });

    it('[getRowFromId] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.getRowFromId as jest.Mock).mockResolvedValue(mockTasks[0]);

        // act
        const result = await getRowFromId(mockTasks[0].id);

        // assert
        expect(TaskModel.getRowFromId).toHaveBeenCalledTimes(1);
        expect(TaskModel.getRowFromId).toHaveBeenCalledWith(mockTasks[0].id, `${BASE_URL}/api/tasks/v1/sql`);
        expect(result).toEqual({ task: mockTasks[0] });
    });

    it('[getRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.getRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(getRowFromId).rejects.toThrow("use-server | view-model | getTasksViewModel | getRowFromId [id: undefined] | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.getRowFromId).toHaveBeenCalledTimes(1);
    });

    it('[deleteRowFromId] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.deleteRowFromId as jest.Mock).mockResolvedValue({ tasks: null });

        // act
        const result = await deleteRowFromId(mockTasks[0].id);

        // assert
        expect(TaskModel.deleteRowFromId).toHaveBeenCalledTimes(1);
        expect(TaskModel.deleteRowFromId).toHaveBeenCalledWith(mockTasks[0].id, `${BASE_URL}/api/tasks/v1/sql`);
        expect(result).toEqual({ tasks: null });
    });

    it('[deleteRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.deleteRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(deleteRowFromId).rejects.toThrow("use-server | view-model | getTasksViewModel | deleteRowFromId [id: undefined] | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.deleteRowFromId).toHaveBeenCalledTimes(1);
    });

    it('[updateRowFromId] - should return an mockdata from TaskModel', async () => {
        // arrange
        const mockUpdatedData = {
            id: 1, title: "updated title", detail: mockTasks[0].detail, completed: true, created_at: ""
        };
        (TaskModel.updateRowFromId as jest.Mock).mockResolvedValue(mockUpdatedData);

        // act
        const result = await updateRowFromId(
            mockTasks, mockUpdatedData.id, mockUpdatedData.title, mockUpdatedData.detail, mockUpdatedData.completed
        );

        // assert
        expect(TaskModel.updateRowFromId).toHaveBeenCalledTimes(1);
        expect(TaskModel.updateRowFromId).toHaveBeenCalledWith(
            mockUpdatedData.id, mockUpdatedData.title, mockUpdatedData.detail, mockUpdatedData.completed,
            `${BASE_URL}/api/tasks/v1/sql`
        );
        expect(result).toEqual({ tasks: [mockUpdatedData, mockTasks[1]] });
    });

    it('[updateRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.updateRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(updateRowFromId).rejects.toThrow("use-server | view-model | getTasksViewModel | updateRowFromId [id: undefined] | catched error: Error - DB fetch failed");

        // assert
        expect(TaskModel.updateRowFromId).toHaveBeenCalledTimes(1);
    });
});
