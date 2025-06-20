import { fetchGraphQL } from './TaskGraphqlClient';

global.fetch = jest.fn();

describe('fetchGraphQL', () => {
  let spyConsoleError: jest.SpyInstance<any, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
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

    expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/bff/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
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

    await expect(fetchGraphQL(query)).rejects.toThrow("use-client | model | TaskGraphqlClient | not ok response: 500: - Internal Server Error ");
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
      'First error message\nSecond error message'
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
      'use-client | model | TaskGraphqlClient | json.errors: unknown error\nunknown error'
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

    await expect(fetchGraphQL(query)).rejects.toThrow('use-client | model | TaskGraphqlClient | json.errors: unknown error ');
  });

  it('throws an error when fetch itself fails (network error)', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
  
    const query = `query { tasks { id } }`;
  
    await expect(fetchGraphQL(query)).rejects.toThrow('Network failure');
  });
});
