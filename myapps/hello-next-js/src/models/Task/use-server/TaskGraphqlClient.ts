"use server"
import { TASKS_API_HEADER, JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { cookies } from 'next/headers';
import { notOkErrorMessage, customResponseMessage } from "@/lib/app/error";

const fnSignature = "use-server | model | TaskGraphqlClient";

export async function fetchGraphQL(query: string, variables?: Record<string, unknown>) {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { DOMAIN_URL } = await import("@/lib/app/common");
  
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
    
    // for reference #2:
    // Apollo Server v4 requires strict adherence to:
    // Content-Type: application/json
    // A valid JSON body with both query and variables keys (even if variables is empty)
    // Whereas apollo-server-micro was more forgiving and didn't enforce body schema as strictly.
    const cookieStore = await cookies();
    const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
    const res = await fetch(`${DOMAIN_URL}/api/tasks/v1/sql/graphql`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
        body: JSON.stringify({ query, variables: variables ?? {} }),
    });

    // capture http level error (http status code is not 2xx)
    if (!res.ok) {
      const errorMsg = await notOkErrorMessage(fnSignature, "fetchGraphql", res);
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
