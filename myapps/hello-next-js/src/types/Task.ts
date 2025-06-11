import { Dispatch, SetStateAction } from "react";

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
