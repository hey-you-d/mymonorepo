// mock the dependencies
jest.mock('../../../../../src/lib/db/db_postgreSQL', () => (
    {
        db: { query: jest.fn(), },
    }
));

jest.mock('../../../../../src/lib/app/common', () => (
    {
        CHECK_API_KEY: jest.fn(), 
        VERIFY_JWT_RETURN_API_RES: jest.fn().mockResolvedValue(true),
    }
));

import handler from '../../../../../pages/api/tasks/v1/sql/create-row';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY, VERIFY_JWT_RETURN_API_RES } from '@/lib/app/common';
import { NextApiRequest, NextApiResponse } from 'next';
import { mockRequestResponse, apiKeyAuthorizationTestSuite } from './index.test';

describe ("Tasks API handler - create-row.ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    apiKeyAuthorizationTestSuite();

    describe("POST request", () => {
        it('should create a new task', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const newTask = { id: 3, title: 'New Task', detail: 'New Detail' };
            (db.query as jest.Mock).mockResolvedValueOnce({ rows: [newTask] });
            
            const { req, res } = mockRequestResponse('POST', 
                { title: 'New Task', detail: 'New Detail' },
                { 'x-api-key': 'valid-key' });
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
            
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *',
                ['New Task', 'New Detail']
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ rows: [newTask] });
            });

        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { title: 'whatever', detail: 'whatever' }, 
                { 'x-api-key': 'whatever' }
            );
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
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
            expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
        });

        it('should handle error 400 bad request', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { title: 'whatever' }, { 'x-api-key': 'whatever' }
            );
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Detail is required' });
        });
    });
});
