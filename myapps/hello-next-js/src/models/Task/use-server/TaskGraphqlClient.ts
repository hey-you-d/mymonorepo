"use server"
import { TASKS_API_HEADER } from "@/lib/app/common";

export async function fetchGraphQL(query: string, variables?: Record<string, unknown>) {
    // for reference:
    // GraphQL does not use HTTP verbs to distinguish operations. Instead:
    // All operations (query, mutation, or subscription) are typically sent via 
    // a single POST request to the GraphQL endpoint.
    // the type of operation is specified in the query string itself.
    // dev note 2:
    // absolute URI for SSR, relative (proper) or absolute (if no choice) URI for CSR
    // SSR: 'http://localhost:3000/api/tasks/v1/sql/graphql'
    // CSR: '/api/tasks/v1/sql/graphql'
    // note: can't be prepended with "/hello-next-js/" 
    const res = await fetch(`/api/tasks/v1/sql/graphql`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({ query, variables }),
    });

    // capture http level error (http status code is not 2xx)
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP error ${res.status}: ${text}`);
    }

    const json = await res.json();

    // capture graphql level error (http status code is still 200)
    if (json.errors) {
      const errorFn = (e: { message: string }) => {
        return e && e.message ? e.message : "error in TaskGraphQL model component";
      }  

      throw new Error(json.errors.map(errorFn).join('\n'));
    }

    return json.data;
}
