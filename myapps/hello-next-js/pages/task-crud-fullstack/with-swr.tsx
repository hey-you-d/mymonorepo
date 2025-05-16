import Layout from "../../pagesLayouts/Layout";
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../pagesLayouts/layout-title";
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/app/models/Task/use-client/TaskModel';
import { TaskWithSWRPage } from '@/app/views/Task/use-client/taskWithSWRPage';
import { BASE_URL } from "@/global/common";

// for reference: alternative function signature:
//type Props = {
//  fallback: Record<string, Task[]>;
//};
//const TaskListWithSWR = ({ fallback }: Props) => {
const TaskListWithSWR = ({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <SWRConfig value={{ fallback }}>
      <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>
        <TaskWithSWRPage />                 
        <br />
      </Layout>
    </SWRConfig>
  );  
};

export const getServerSideProps: GetServerSideProps = async () => {
  // Inside getServerSideProps, we can't use a relative URL  
  const tasks = await (new TaskModel()).getTasksDBRows(`${BASE_URL}/api/tasks/v1/bff`);
  
  return {
    props: {
      fallback: {
          'Tasks-API': tasks,
      },
    },
  };
};

export default TaskListWithSWR;
