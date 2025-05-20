export type Task = {
    id: number,
    title: string,
    detail: string,
    completed: boolean,
    created_at: string
}

export type DataFetchModeType = "getStaticPaths" | "getStaticProps" | "getServerSideProps" | "useEffect";

export type TaskTableType = {
    tasks: Task[], 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<void>,
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<void>
}
