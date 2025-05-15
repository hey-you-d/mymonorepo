import Layout from "../../pagesLayouts/Layout";
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { TaskWithSearchFilterPage } from '@/app/views/Task/from-client/taskWithSearchFilterPage';
import { DATA_FETCH_MODE } from '../../feature-flags/tasksBff';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/app/models/Task/use-client/TaskModel';

const TasksTableWithSearchFilter = ({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const body = (
    <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
      <TaskWithSearchFilterPage />                 
      <br />
    </Layout>
  );
  
  return DATA_FETCH_MODE === "getServerSideProps" 
    ? <SWRConfig value={{ fallback }}>{body}</SWRConfig>
    : body;
};

export const getServerSideProps: GetServerSideProps = async () => {
  if (DATA_FETCH_MODE === "getServerSideProps") {
    const tasks = await (new TaskModel()).getTasksDBRows();
    return {
      props: {
        fallback: {
           'Tasks-API': tasks,
        },
      },
    };
  }

  return {
    props: {}, // skip SSR, that means getTasksDBRows() is called with useEffect (CSR approach)
  };
};

export default TasksTableWithSearchFilter;
