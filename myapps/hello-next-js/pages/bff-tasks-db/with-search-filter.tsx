import Layout from '../../components/Layout';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { TaskWithSearchFilterPage } from '@/app/views/taskWithSearchFilterPage';
import { DATA_FETCH_MODE } from '../../constants/tasksBff';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/app/models/TaskModel';

const TasksTableWithSearchFilter = ({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const body = (
    <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
      <h2>With Search/Filter feature</h2>
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
