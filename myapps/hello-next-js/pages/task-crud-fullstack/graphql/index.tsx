import Layout from '../../../pagesLayouts/Layout';
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../pagesLayouts/layout-title";
import { TaskGraphQLPage } from '@/views/Task/use-client/taskGraphQLPage';

const BffTasksDB = () => {
  const body = (
    <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskGraphQLPage />                 
      <br />
    </Layout>
  );
  
  return body;
};

export default BffTasksDB;
