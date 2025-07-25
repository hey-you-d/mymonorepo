import { Dispatch, SetStateAction } from "react";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { JwtPayload } from 'jsonwebtoken';

export type Task = {
    id: number,
    title: string,
    detail: string,
    completed: boolean,
    created_at: string
}

// For Page router only 
export type DataFetchModeType = "getStaticPaths" | "getStaticProps" | "getServerSideProps" | "useEffect";

export type TaskTableType = {
    tasks: Task[], 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<void>,
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<void>
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

export type UserModelType = {
    email?: string,
    password?: string,
    jwt?: string,
    admin?: boolean,
    error: boolean,
    message: string,
}

export type UsersDbQueryResultType = {
    id: number,
    auth_type: "basic_auth" | "basic_auth_refresh_token",
    email: string,
    hashed_pwd: string,
    jwt: string,
    admin_access: boolean,
    created_at: typeof Date,
    updated_at: typeof Date,
}

export type TaskUserType = {
    userAuthenticated: boolean,
    setUserAuthenticated: Dispatch<SetStateAction<boolean>>,
}

export type GraphQLContext = {
  req: ExpressRequest;
  res: ExpressResponse;
  user?: unknown; // optional, if you add decoded user info after verifying JWT
};

export type VerifyJwtResult =
  | { valid: true; payload: string | JwtPayload }
  | { valid: false; error: string };

export type AppRouterPageProps = {
    params: { id: string };
    searchParams?: { [key: string]: string | string[] | undefined }; // to retrieve query param: &from=""
}   
