import { DOMAIN_URL } from '@/lib/app/common';

describe('fetchGraphQL', () => {
  const mockApiHeader = {
    'Content-Type': 'application/json',
    'x-api-key': 'dummy-test-key',
    'Authorization': 'Bearer valid-jwt',
  };

  let fetchGraphQL: typeof import('./TaskGraphqlClient').fetchGraphQL;
  let spyConsoleError: jest.SpyInstance<any, any>;
  let spyConsoleLog: jest.SpyInstance<any, any>;

  beforeAll(async () => {
    jest.resetModules();

    // Must go before any imports
    jest.doMock('../../../lib/app/common', () => ({
      TASKS_SQL_BASE_API_URL: '/api/tasks/v1/sql',
      TASKS_API_HEADER: jest.fn().mockResolvedValue(mockApiHeader),
      DOMAIN_URL: 'http://localhost:3000',
    }));

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

    // Re-import AFTER mocks are in place
    fetchGraphQL = (await import('./TaskGraphqlClient')).fetchGraphQL;
  
    // define fetch after import
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    spyConsoleLog = jest.spyOn(console, "log").mockImplementation(()=> {});
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
    spyConsoleLog.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('sends the correct POST request and returns data', async () => {
    const mockData = { someField: 'value' };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: mockData }),
    });

    const query = `query { tasks { id } }`;
    const variables = { id: 1 };

    const result = await fetchGraphQL(query, variables);

    expect(fetch).toHaveBeenCalledWith(`${DOMAIN_URL}/api/tasks/v1/sql/graphql`, {
      method: 'POST',
      headers: mockApiHeader,
      body: JSON.stringify({ query, variables }),
    });
    
    expect(result).toEqual(mockData);
  });

  it('throws an HTTP error when http returns non 2xx status code', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      text: jest.fn().mockResolvedValue("Internal Server Error"),
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow(
      "use-server | model | TaskGraphqlClient | fetchGraphql | not ok response: 500 - Server Error "
    );
  });

  it('throws an error when GraphQL response contains errors', async () => {
    const errorMessages = [
      { message: 'First error message' },
      { message: 'Second error message' },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        errors: errorMessages,
      }),
    });

    const query = `query { tasks { id } }`;
    
    await expect(fetchGraphQL(query)).rejects.toThrow(
      "use-server | model | TaskGraphqlClient | fetchGraphQL - json error | First error message-Second error message"
    );
  });

  it('throws generic error message if error object is missing message', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        errors: [null, {}],
      }),
    });

    const query = `query { tasks { id } }`;
    
    await expect(fetchGraphQL(query)).rejects.toThrow(
      "use-server | model | TaskGraphqlClient | fetchGraphQL - json error | unknown error-unknown error"
    );
  });

  it('handles non-{ message: string } objects in errors array', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ 
        errors: [{ foo: 'bar' }] // instead of [{ message: 'bar' }]
      }), 
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow(
      "use-server | model | TaskGraphqlClient | fetchGraphQL - json error | unknown error"
    );
  });

  it('throws an error when fetch itself fails (network error)', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
  
    const query = `query { tasks { id } }`;
  
    await expect(fetchGraphQL(query)).rejects.toThrow('Network failure');
  });
});
