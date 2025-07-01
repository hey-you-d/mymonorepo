import Layout from "../../pagesLayouts/Layout";
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../pagesLayouts/layout-title";
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { TaskWithSearchFilterPage } from '@/views/Task/use-client/taskWithSearchFilterPage';
import { SWRConfig } from 'swr';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";

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
  try {
    // Inside getServerSideProps, we can't use a relative URL  
    const tasks = await (new TaskModel()).getTasksDBRows(TASKS_BFF_BASE_API_URL);
    
    return {
      props: {
        fallback: {
            'Tasks-API': tasks,
        },
      },
    };
  } catch(error) {
    return {
      props: {
        fallback: {
            'Tasks-API': null,
        },
      },
    }
  }
};

export default TasksTableWithSearchFilter;
