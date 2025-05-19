import * as TaskModel from '../../../models/Task/use-server/TaskModel';
import { Task } from '@/types/Task';
import { deleteRowFromId, seedTasksDB, updateRowFromId } from './getTasksViewModel';

jest.mock('../../../models/Task/use-server/TaskModel', () => ({
    getTasksDBRows: jest.fn(),
    deleteAllRows: jest.fn(),
    seedTasksDB: jest.fn(),
    createRow: jest.fn(),
    getRowFromId: jest.fn(),
    deleteRowFromId: jest.fn(),
    updateRowFromId: jest.fn(),
}));

describe('getTaskViewModel', () => {
    const mockTasks: Task[] = [
        { id: 1, title: 'Test Task 1', detail: 'Task 1 detail', completed: false, created_at: "" },
        { id: 2, title: 'Test Task 2', detail: 'Task 2 detail', completed: true, created_at: "" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('[getTasksDBRows] - should return tasks from TaskModel', async () => {
        // arrange
        (TaskModel.getTasksDBRows as jest.Mock).mockResolvedValue(mockTasks);

        // act
        const result = await TaskModel.getTasksDBRows();

        // assert
        expect(TaskModel.getTasksDBRows).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockTasks);
    });

    it('[getTasksDBRows] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.getTasksDBRows as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.getTasksDBRows()).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.getTasksDBRows).toHaveBeenCalledTimes(1);
    });

    it('[deleteAllRows] - should return an empty Task array from TaskModel', async () => {
        // arrange
        (TaskModel.deleteAllRows as jest.Mock).mockResolvedValue([]);

        // act
        const result = await TaskModel.deleteAllRows();

        // assert
        expect(TaskModel.deleteAllRows).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });

    it('[deleteAllRows] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.deleteAllRows as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.deleteAllRows()).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.deleteAllRows).toHaveBeenCalledTimes(1);
    });

    it('[seedTaskDB] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.seedTasksDB as jest.Mock).mockResolvedValue(mockTasks);

        // act
        const result = await TaskModel.seedTasksDB();

        // assert
        expect(TaskModel.seedTasksDB).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockTasks);
    });

    it('[seedTaskDB] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.seedTasksDB as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.seedTasksDB()).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.seedTasksDB).toHaveBeenCalledTimes(1);
    });

    it('[createRow] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.createRow as jest.Mock).mockResolvedValue(mockTasks[0]);

        // act
        const result = await TaskModel.createRow("x", "y");

        // assert
        expect(TaskModel.createRow).toHaveBeenCalledTimes(1);
        expect(TaskModel.createRow).toHaveBeenCalledWith("x", "y");
        expect(result).toEqual(mockTasks[0]);
    });

    it('[createRow] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.createRow as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.createRow).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.createRow).toHaveBeenCalledTimes(1);
    });

    it('[getRowFromId] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.getRowFromId as jest.Mock).mockResolvedValue(mockTasks[0]);

        // act
        const result = await TaskModel.getRowFromId(mockTasks[0].id);

        // assert
        expect(TaskModel.getRowFromId).toHaveBeenCalledTimes(1);
        expect(TaskModel.getRowFromId).toHaveBeenCalledWith(mockTasks[0].id);
        expect(result).toEqual(mockTasks[0]);
    });

    it('[getRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.getRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.getRowFromId).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.getRowFromId).toHaveBeenCalledTimes(1);
    });

    it('[deleteRowFromId] - should return an mockdata from TaskModel', async () => {
        // arrange
        (TaskModel.deleteRowFromId as jest.Mock).mockResolvedValue({ tasks: null });

        // act
        const result = await TaskModel.deleteRowFromId(mockTasks[0].id);

        // assert
        expect(TaskModel.deleteRowFromId).toHaveBeenCalledTimes(1);
        expect(TaskModel.deleteRowFromId).toHaveBeenCalledWith(mockTasks[0].id);
        expect(result).toEqual({ tasks: null });
    });

    it('[deleteRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.deleteRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.deleteRowFromId).rejects.toThrow(mockError);

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
        const result = await TaskModel.updateRowFromId(mockTasks[0].id, "updated title", mockTasks[0].detail, true);

        // assert
        expect(TaskModel.updateRowFromId).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUpdatedData);
    });

    it('[updateRowFromId] - should throw and log an error if TaskModel fails', async () => {
        // arrange
        const mockError = new Error('DB fetch failed');   
        (TaskModel.updateRowFromId as jest.Mock).mockRejectedValue(mockError);
        
        // act
        await expect(TaskModel.updateRowFromId).rejects.toThrow(mockError);

        // assert
        expect(TaskModel.updateRowFromId).toHaveBeenCalledTimes(1);
    });
});
