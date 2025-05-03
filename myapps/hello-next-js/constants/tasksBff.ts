import { DataFetchModeType } from "@/app/types/Task";

//export const DATA_FETCH_MODE: DataFetchModeType = "useEffect";
//export const TASKS_BFF_BASE_API_URL = "/api/tasks/v1/sql";
export const DATA_FETCH_MODE: DataFetchModeType = "getServerSideProps";
export const TASKS_BFF_BASE_API_URL = `http://localhost:3000/hello-next-js/api/tasks/v1/sql`;
