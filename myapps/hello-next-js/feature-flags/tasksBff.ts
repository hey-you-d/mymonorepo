import { DataFetchModeType } from "@/app/types/Task";

export const DOMAIN_URL = process.env.NODE_ENV === "production"
    ? "https://www.yudimankwanmas.com"
    : "http://localhost:3000";
export const BASE_URL = `${DOMAIN_URL}/hello-next-js`;

//export const DATA_FETCH_MODE: DataFetchModeType = "useEffect";
export const DATA_FETCH_MODE: DataFetchModeType = "getServerSideProps";

export const TASKS_BFF_BASE_API_URL = 
    `${["getServerSideProps", "getStaticPaths", "getStaticProps"].includes(DATA_FETCH_MODE) 
        ? BASE_URL 
        : ""}/api/tasks/v1/bff`;

export const TASKS_SQL_BASE_API_URL = 
  `${["getServerSideProps", "getStaticPaths", "getStaticProps"].includes(DATA_FETCH_MODE) 
      ? BASE_URL 
      : ""}/api/tasks/v1/sql`;        

export const TABLE_FILTER_OPTIMISATION = {
  withUseDeferredValue: true, // recommended to optimise your filter feature 
  withUseTransition: false, // not recommended for this use case scenario
}
        