import Layout from "../../pagesLayouts/Layout";
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../pagesLayouts/layout-title";
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { TaskWithSearchFilterPage } from '@/views/Task/use-client/taskWithSearchFilterPage';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/models/Task/use-client/TaskModel';

const TasksTableWithSearchFilter = ({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <SWRConfig value={{ fallback }}>
      <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>
        <TaskWithSearchFilterPage />                 
        <br />
      </Layout>
    </SWRConfig>
  )  
};

export const getServerSideProps: GetServerSideProps = async () => {
  const tasks = await (new TaskModel()).getTasksDBRows();
  
  return {
    props: {
      fallback: {
          'Tasks-API': tasks,
      },
    },
  };
};

export default TasksTableWithSearchFilter;
