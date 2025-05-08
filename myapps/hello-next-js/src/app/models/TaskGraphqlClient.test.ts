import { fetchGraphQL } from './TaskGraphqlClient';

global.fetch = jest.fn();

describe('fetchGraphQL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the correct POST request and returns data', async () => {
    const mockData = { someField: 'value' };
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: mockData }),
    });

    const query = `query { tasks { id } }`;
    const variables = { id: 1 };

    const result = await fetchGraphQL(query, variables);

    expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    expect(result).toEqual(mockData);
  });

  it('throws an error when GraphQL response contains errors', async () => {
    const sampleMsg = "Test 123 - Something went wrong";
    const mockErrors = [{ message: sampleMsg }];
    
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ errors: mockErrors }),
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow(sampleMsg);
  });

  it('handles non-{ message: string } objects in errors array', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ errors: [{ foo: 'bar' }] }), // instead of { message: 'bar' }
    });

    const query = `query { tasks { id } }`;

    await expect(fetchGraphQL(query)).rejects.toThrow('error in TaskGraphQL model component');
  });
});
