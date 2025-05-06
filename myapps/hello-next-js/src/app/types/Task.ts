export type Task = {
    id: number,
    title: string,
    detail: string,
    completed: boolean,
    created_at: string
}

export type DataFetchModeType = "getStaticPaths" | "getStaticProps" | "getServerSideProps" | "useEffect";
