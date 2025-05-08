export async function fetchGraphQL(query: string, variables = {}) {
    // dev note:
    // GraphQL does not use HTTP verbs to distinguish operations. Instead:
    // All operations (query, mutation, or subscription) are typically sent via 
    // a single POST request to the GraphQL endpoint.
    // the type of operation is specified in the query string itself.
    const res = await fetch('/api/tasks/v1/sql/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });
    
    const json = await res.json();

    if (json.errors) {
      const errorFn = (e: { message: string }) => {
        return e && e.message ? e.message : "error in TaskGraphQL model component";
      }  

      throw new Error(json.errors.map(errorFn).join('\n'));
    }

    return json.data;
}
