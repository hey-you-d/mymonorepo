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

import handler, { values, placeholders } from '../../../../../pages/api/tasks/v1/sql/seed-table';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { NextApiRequest, NextApiResponse } from 'next';
import { mockRequestResponse, apiKeyAuthorizationTestSuite } from './index.test';

describe ("Tasks API handler - seed-table.ts", () => {
    let spyConsoleError: jest.SpyInstance<any, any>;
    
    beforeEach(() => {
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});

        jest.clearAllMocks();
    });

    apiKeyAuthorizationTestSuite();

    describe("POST request", () => {
        it('should perform the correct logic to supply parameter for the DB query', async () => {
            expect(values).toContain("Build Next.js CRUD");
            expect(values).toContain("Add full backend API layer to hello-next-js app");
            expect(values).toContain("Caching - Frontend");
            expect(values).toContain("useSWR, or React Query, or Next.js middleware");
            expect(placeholders).toContain("($1, $2), ($3, $4), ($5, $6)");
        });

        it('should return status code 201 upon successful DB seed operation', async () => {
            // Set up the CHECK_API_KEY mock to return success response
            (CHECK_API_KEY as jest.Mock).mockReturnValue(true);
            
            const { req, res } = mockRequestResponse('POST', 
                { 'x-api-key': 'valid-key' });
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res.status).toHaveBeenCalledWith(201);
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
            expect(res.json).toHaveBeenCalledWith({ error: "tasks/v1 | API | seed-table.ts | POST | catched error: Error - Connection error", });
        });
    });
});        