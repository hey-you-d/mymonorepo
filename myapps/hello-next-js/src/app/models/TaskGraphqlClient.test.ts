import { fetchGraphQL } from './TaskGraphqlClient';

global.fetch = jest.fn();

describe('fetchGraphQL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.skip('sends the correct POST request and returns data', async () => {
    const mockData = { someField: 'value' };
    (fetch as jest.Mock).mockResolvedValue({
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
      body: JSON.stringify({ query, variables }),
    });
    
    expect(result).toEqual(mockData);
  });

  it.skip('throws an error when GraphQL response contains errors', async () => {
    const sampleMsg = "Test 123 - Something went wrong";
    const mockErrors = [{ message: sampleMsg }];
    
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ errors: mockErrors }),
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow(sampleMsg);
  });

  it.skip('handles non-{ message: string } objects in errors array', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ errors: [{ foo: 'bar' }] }), // instead of { message: 'bar' }
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow('error in TaskGraphQL model component');
  });

  it.skip('throws an error when fetch itself fails (network error)', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
  
    const query = `query { tasks { id } }`;
  
    await expect(fetchGraphQL(query)).rejects.toThrow('Network failure');
  });
  
  it.skip('throws an error when response.json() fails (bad JSON)', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });
  
    const query = `query { tasks { id } }`;
  
    await expect(fetchGraphQL(query)).rejects.toThrow('Invalid JSON');
  });
});
