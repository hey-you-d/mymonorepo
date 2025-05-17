import Layout from "../../../pagesLayouts/Layout";
import { SERVER_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../pagesLayouts/layout-title";
import { TaskPage } from '@/views/Task/use-server/taskPage';

const UseServerTaskList = () => {
  return (
    <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskPage />                 
      <br />
    </Layout>
  );  
};

export default UseServerTaskList;
