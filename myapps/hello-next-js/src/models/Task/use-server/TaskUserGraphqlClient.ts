"use server"
import { TASKS_API_HEADER } from "@/lib/app/common";
import { UserModelType, UsersDbQueryResultType } from "@/types/Task";
import { notOkErrorMessage, customResponseMessage } from "@/lib/app/error";

const fnSignature = "use-server | model | TaskUserGraphqlClient";

export async function fetchGraphQL(query: string, variables?: Record<string, unknown>) {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_DOMAIN_API_URL } = await import("@/lib/app/common");

    const res = await fetch(`${TASKS_SQL_DOMAIN_API_URL}/user/graphql`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(), // JWT auth is not needed for registration/login process 
        body: JSON.stringify({ query, variables: variables ?? {} }),
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
