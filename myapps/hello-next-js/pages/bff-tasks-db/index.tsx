import Layout from '../../components/Layout';
import { TaskPage } from '@/app/views/taskPage';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/app/models/TaskModel';
//import { Task } from '@/app/types/Task';
import { DATA_FETCH_MODE } from '../../constants/tasksBff';

//type Props = {
//  fallback: Record<string, Task[]>;
//};

// dev note: alternatively...
//const BffTasksDB = ({ fallback }: Props) => {
const BffTasksDB = ({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const body = (
    <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
      <TaskPage />                 
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

export default BffTasksDB;
