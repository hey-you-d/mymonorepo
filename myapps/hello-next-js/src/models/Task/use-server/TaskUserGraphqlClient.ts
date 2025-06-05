"use server"
import { TASKS_API_HEADER } from "@/lib/app/common";
import { UserModelType, UsersDbQueryResultType } from "@/types/Task";

export async function fetchGraphQL(query: string, variables?: Record<string, unknown>) {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { DOMAIN_URL } = await import("@/lib/app/common");

    const res = await fetch(`${DOMAIN_URL}/api/tasks/v1/sql/user/graphql`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({ query, variables: variables ?? {} }),
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
        return e && e.message ? e.message : "error in TaskUserGraphQLClient model component";
      }  

      throw new Error(json.errors.map(errorFn).join('\n'));
    }

    let finalKey =  null;
    // to handle the lookupUser query
    if (variables && variables.email && !variables.password && !variables.jwt) {
      const { lookupUser }: { lookupUser: UsersDbQueryResultType | null } = json.data;
      finalKey = lookupUser;
    }
    
    // to handle the registerUser mutation
    if (variables && variables.email && variables.password && variables.jwt) {
      const { registerUser }: { registerUser: UsersDbQueryResultType | null } = json.data;
      finalKey = registerUser;
    }

    const output: UserModelType = finalKey && finalKey !== null ? {
      email: finalKey.email,
      password: finalKey.hashed_pwd,
      jwt: finalKey.jwt,
      admin: finalKey.admin_access,
      error: false, 
      message: "successful graphql op"
    } : {
      error: true, 
      message: "user not found"
    };
    
    return output;
}
