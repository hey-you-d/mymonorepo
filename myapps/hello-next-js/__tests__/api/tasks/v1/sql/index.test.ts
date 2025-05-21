import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/tasks/v1/sql';
import { db, DB } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

// mock the dependencies
jest.mock('../../../../../src/lib/db/db_postgreSQL', () => (
    {
        query: jest.fn(),
    }
));

jest.mock('../../../../../src/lib/app/common', () => (
    {
        CHECK_API_KEY: jest.fn().mockImplementation(() => Promise.resolve()), 
    }
));

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
            const { req , res } : { req: NextApiRequest, res: NextApiResponse } = mockRequestResponse('GET');
            await handler(req, res);
            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
        });
    });

    describe("GET request", () => {
        
    }); 
});


