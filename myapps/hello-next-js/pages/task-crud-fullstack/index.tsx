import Layout from "../../pagesLayouts/Layout";
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../pagesLayouts/layout-title";
import { TaskPage } from '@/app/views/Task/use-client/taskPage';

const TaskList = () => {
  return (
    <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskPage />                 
      <br />
    </Layout>
  );  
};

export default TaskList;
