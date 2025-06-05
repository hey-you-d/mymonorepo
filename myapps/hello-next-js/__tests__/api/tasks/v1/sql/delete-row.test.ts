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

import handler from '../../../../../pages/api/tasks/v1/sql/delete-rows';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { NextApiRequest, NextApiResponse } from 'next';
import { mockRequestResponse, apiKeyAuthorizationTestSuite } from './index.test';

describe ("Tasks API handler - delete-rows.ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    apiKeyAuthorizationTestSuite();

    // POST not DELETE request? Check the comment in delete-row.ts 
    describe("POST request", () => {
        it('should delete all tasks in the DB', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'x-api-key': 'valid-key' });
            
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(db.query).toHaveBeenCalledWith('DELETE FROM tasks');
            expect(res.status).toHaveBeenCalledWith(200);
        });
        it('should handle database error', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);

            const dbError = new Error('Connection error');
            (db.query as jest.Mock).mockRejectedValueOnce(dbError);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'x-api-key': 'whatever' }
            );
                        
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});    