// app router
import Layout from "../../../../pagesLayouts/Layout";
import { SERVER_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../../pagesLayouts/layout-title";
import { TaskPage } from '@/views/Task/use-server/taskPage';

export default async function AppRouterUseServerTaskList() {
  return (
    <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskPage />
      <br/>
    </Layout>
  );
}
