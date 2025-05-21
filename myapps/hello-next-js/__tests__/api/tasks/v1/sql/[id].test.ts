// mock the dependencies
jest.mock('../../../../../src/lib/db/db_postgreSQL', () => (
    {
        db: { query: jest.fn(), },
    }
));

jest.mock('../../../../../src/lib/app/common', () => (
    {
        CHECK_API_KEY: jest.fn(), 
    }
));

import handler from '../../../../../pages/api/tasks/v1/sql/[id]';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { mockRequestResponse, apiKeyAuthorizationTestSuite } from './index.test';

describe ("Tasks API handler - [id].ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    apiKeyAuthorizationTestSuite();

    describe("GET request", () => {
        it('should get a task with matching ID', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const obtainedTask = { id: 3, title: 'Task 3', detail: 'Detail 3', completed: true, created_at: "" };
            (db.query as jest.Mock).mockResolvedValue({ rows: [obtainedTask] });

            const { req, res } = mockRequestResponse('GET', 
                {},
                { 'x-api-key': 'valid-key' },
                { id: '3' }
            );
            
            await handler(req, res);

            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE id = $1', [3]
            );
               
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(obtainedTask);
        });

        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('GET', 
                {},
                { 'x-api-key': 'valid-key' },
                { id: '1' }
            );
            
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
        
    }); 

    describe("PUT request", () => {
        it('should update an existing task', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const newTask = { id: 3, title: 'New Task 3', detail: 'New Detail 3', completed: true };
            (db.query as jest.Mock).mockResolvedValue({ rows: [newTask] });
            
            const { req, res } = mockRequestResponse('PUT', 
                { title: newTask.title, detail: newTask.detail, completed: newTask.completed, id: newTask.id },
                { 'x-api-key': 'valid-key' },
                { id: String(newTask.id) }
            );    
            
            await handler(req, res);
            
            expect(db.query).toHaveBeenCalledWith(
                'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *',
                [newTask.title, newTask.detail, newTask.completed, newTask.id]
            );
               
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(newTask);
        });

        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const newTask = { id: 3, title: 'New Task 3', detail: 'New Detail 3', completed: true };
            const { req, res } = mockRequestResponse('PUT', 
                { title: newTask.title, detail: newTask.detail, completed: newTask.completed, id: newTask.id },
                { 'x-api-key': 'valid-key' },
                { id: String(newTask.id) }
            );

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
        
        it('should handle error 400 bad request', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('PUT', 
                { 'whatever': 'whatever' }, { 'x-api-key': 'whatever' }, { id: "whatever" }
            );
                        
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID' });
        });

        it('should handle error 400 bad request', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            //const dbError = new Error('Connection error');
            //(db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('PUT', 
                { id: 1, title: 'whatever' }, { 'x-api-key': 'whatever' }, { id: "whatever" }
            );
                        
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID' });
        });
    });

    describe("DELETE request", () => {
        it('should delete an existing task in DB with matching ID', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            const deletedTask = { id: 3, title: 'New Task 3', detail: 'New Detail 3', completed: true };
            (db.query as jest.Mock).mockResolvedValue({ rows: [deletedTask] });
            
            const { req, res } = mockRequestResponse('DELETE',
                {}, 
                { 'x-api-key': 'valid-key' },
                { id: '3' });
             
            await handler(req, res);
            
            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE id = $1 RETURNING *', [3]
            );
               
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(deletedTask);
        });

        it('should return 404 when task does not exist', async () => {
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            (db.query as jest.Mock).mockResolvedValue({ rows: [] }); // Empty result

            const { req, res } = mockRequestResponse('DELETE', {}, { 'x-api-key': 'valid-key' });
            req.query = { id: '999' }; // Non-existent ID

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });

        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('DELETE', 
                {},
                { 'x-api-key': 'valid-key' },
                { id: '3' }
            );
            req.query = { id: "3" };
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });

        it('should return status code 400 given a wrong type of param', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            //const dbError = new Error('Connection error');
            //(db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('DELETE', 
                {},
                { 'x-api-key': 'valid-key' },
                {  id: "a string"  }
            );
            
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID' });
        });
    });
});
