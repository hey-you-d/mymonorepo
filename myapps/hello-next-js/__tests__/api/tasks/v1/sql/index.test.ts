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
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

// helper function to create mock request/response objects
type ApiMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export const mockRequestResponse = (method: ApiMethodType, body = {}, headers = {}, query?: {}) => {
    const { req, res } = createMocks(
        {
            method,
            body,
            headers,
        }
    );

    if (query) {
        // Add query parameters
        req.query = query;
    }

    // add jest spy methods to track response methods
    // for reference: mockReturnThis creates a mock function that returns the this context of the object
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.setHeader = jest.fn().mockReturnThis();
    res.end = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    
    return { req, res };
};

export const apiKeyAuthorizationTestSuite = () => {
    describe("API Key Authorization", () => {
        it("should call CHECK_API_KEY on request", async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
        
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'valid-key' });
        
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
        
            expect(CHECK_API_KEY).toHaveReturnedWith(true);
            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);

            expect(db.query).toHaveBeenCalled();
        });

        it('should not proceed if CHECK_API_KEY fails', async () => {
            // Configure the mock to simulate failed authentication
            (CHECK_API_KEY as jest.Mock).mockReturnValue(false);
            
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'invalid-key' });
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
        
            expect(CHECK_API_KEY).toHaveReturnedWith(false);
            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "tasks/v1 | API | index.ts | handler | Unauthorized access: invalid API key", });
        
            // Database query should NOT be called if authentication fails
            expect(db.query).not.toHaveBeenCalled();
        });
    });    
};

describe ("Tasks API handler - index.ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    let spyConsoleLog: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
        spyConsoleLog = jest.spyOn(console, "log").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    afterEach(() => {
        spyConsoleError.mockClear();
        spyConsoleLog.mockClear();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    apiKeyAuthorizationTestSuite();

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
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
            
            expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY id DESC');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTasks);
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('GET', {}, { 'x-api-key': 'whatever' });
                        
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "tasks/v1 | API | index.ts | GET | catched error: Error - Connection error", });
        });
    }); 

    describe("POST request", () => {
        it('should create a new task', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const newTask = { id: 3, title: 'New Task' };
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [newTask] });
            
            const { req, res } = mockRequestResponse('POST', { title: 'New Task' });
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
                ['New Task']
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newTask);
            });

        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'title': 'whatever' }, { 'x-api-key': 'whatever' }
            );
                        
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "tasks/v1 | API | index.ts | POST | catched error: Error - Connection error", });
        });
        
        it('should handle error 400 bad request', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'whatever': 'whatever' }, { 'x-api-key': 'whatever' }
            );
                        
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'tasks/v1 | API | index.ts | POST | Title is required' });
        });
    });
});


