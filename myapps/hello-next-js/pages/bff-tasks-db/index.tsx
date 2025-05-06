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
  return ( 
    <SWRConfig value={{ fallback }}>
      <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
        <TaskPage />                 
        <br />
      </Layout>
    </SWRConfig>
  );
};

const getServerSideProps: GetServerSideProps = async () => {
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

  // Dev note: A workaround to retain the getServerSideProps In case the taskModel.getTasksDBRows() is 
  // called within the useEffect in the react hook (viewmodel component), hence 
  // demonstrating CSR instead of SSR data fetching
  return {
    props: {
      fallback: {
        'Tasks-API': [],
      },
    },
  };
};

export default BffTasksDB;
