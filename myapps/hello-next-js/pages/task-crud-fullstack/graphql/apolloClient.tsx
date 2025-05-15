import Layout from '../../../pagesLayouts/Layout';
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../pagesLayouts/layout-title";
import { TaskApolloClientPage } from '@/app/views/Task/from-client/taskApolloClientPage';

const BffTasksDB = () => {
  const body = (
    <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskApolloClientPage />                 
      <br />
    </Layout>
  );
  
  return body;
};

export default BffTasksDB;