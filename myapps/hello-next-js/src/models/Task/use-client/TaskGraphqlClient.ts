"use client"

import { customResponseMessage, notOkErrorMessage } from "@/lib/app/error";
import { TASKS_BFF_RELATIVE_URL } from "@/lib/app/common";

const fnSignature = "use-client | model | TaskGraphqlClient";

export async function fetchGraphQL(query: string, variables = {}) {
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
    const res = await fetch(`${TASKS_BFF_RELATIVE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        body: JSON.stringify({ query, variables }),
    });

    // capture http level error (http status code is not 2xx)
    if (!res.ok) {
      const errorMsg = await notOkErrorMessage(fnSignature, "fetchGraphQL", res);
      throw new Error(errorMsg);
    }

    const json = await res.json();

    // capture graphql level error (http status code is still 200)
    if (json.errors) {
      const errorFn = (e: { message: string }) => {
        return e && e.message ? e.message : "unknown error";
      }  
      const errorMsg = await customResponseMessage(fnSignature, "fetchGraphQL - json error", json.errors.map(errorFn).join('-'));
      throw new Error(errorMsg);
    }

    return json.data;
}
