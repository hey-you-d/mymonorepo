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

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/tasks/v1/sql';
import { db, DB } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

// helper function to create mock request/response objects
type ApiMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
const mockRequestResponse = (method: ApiMethodType, body = {}, query = {}) => {
    const { req, res } = createMocks(
        {
            method,
            body,
            query,
        }
    );

    // add jest spy methods to track response methods
    // for reference: mockReturnThis creates a mock function that returns the this context of the object
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.setHeader = jest.fn().mockReturnThis();
    res.end = jest.fn().mockReturnThis();

    return { req, res };
};

describe ("Tasks API handler - index.ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    describe("API Key Authorization", () => {
        it("should call CHECK_API_KEY on request", async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
      
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'valid-key' });
      
            await handler(req as NextApiRequest, res as NextApiResponse);
      
            expect(CHECK_API_KEY).toHaveReturnedWith(true);
            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);

            expect(db.query).toHaveBeenCalled();
        });

        it('should not proceed if CHECK_API_KEY fails', async () => {
            // Configure the mock to simulate failed authentication
            (CHECK_API_KEY as jest.Mock).mockReturnValue(false);
            
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'invalid-key' });
            await handler(req as NextApiRequest, res as NextApiResponse);
      
            expect(CHECK_API_KEY).toHaveReturnedWith(false);
            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access: invalid API key" });
      
            // Database query should NOT be called if authentication fails
            expect(db.query).not.toHaveBeenCalled();
        });
    });

    describe("GET request", () => {
        it('should return tasks from the database', async () => {
            const mockTasks = [
                { id: 2, title: 'Task 2' },
                { id: 1, title: 'Task 1' },
            ];

            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockTasks });

            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'whatever' });
            await handler(req as NextApiRequest, res as NextApiResponse);
            
            expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY id DESC');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTasks);
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'whatever' });
                        
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    }); 

    describe("POST request", () => {
        it('should create a new task', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const newTask = { id: 3, title: 'New Task' };
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [newTask] });
            
            const { req, res } = mockRequestResponse('POST', { title: 'New Task' });
            await handler(req, res);
            
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
                ['New Task']
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newTask);
            });

        it('should handle database error', async () => {
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'title': 'whatever' }, { 'x-api-key': 'whatever' }
            );
                        
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
        
        it('should handle error 400 bad request', async () => {
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'whatever': 'whatever' }, { 'x-api-key': 'whatever' }
            );
                        
            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
        });
    });
});


