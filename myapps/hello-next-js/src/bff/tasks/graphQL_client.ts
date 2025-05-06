export async function fetchGraphQL(query: string, variables = {}) {
    const res = await fetch('/api/tasks/v1/sql/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });
    
    const json = await res.json();
    if (json.errors) {
      throw new Error(json.errors.map((e: unknown) => e instanceof Error ? e.message : "error in graphQL_client module").join('\n'));
    }

    return json.data;
}
