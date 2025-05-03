import Layout from '../../components/Layout';
import { TaskPage } from '@/app/views/taskPage';
import { GetServerSideProps } from 'next';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/app/models/TaskModel';
import { Task } from '@/app/types/Task';
import { DATA_FETCH_MODE } from '../../constants/tasksBff';

type Props = {
  fallback: Record<string, Task[]>;
};

const BffTasksDB = ({ fallback }: Props) => {
  return ( 
    <SWRConfig value={{ fallback }}>
      <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
        <TaskPage />                 
        <br />
      </Layout>
    </SWRConfig>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // for SSR demo purpose
  if (DATA_FETCH_MODE === "getServerSideProps") {
    const taskModel = new TaskModel();
    const tasks = await taskModel.getTasksDBRows();
    return {
      props: {
        fallback: {
           'Tasks-API': tasks,
        },
      },
    };
  }

  return {
    props: {
      fallback: {
        'Tasks-API': [],
      },
    },
  };
};

export default BffTasksDB;
