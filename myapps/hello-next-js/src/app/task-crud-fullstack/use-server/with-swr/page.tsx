// for reference: app router - this is a server component by default
// unlike the page router's page folder - client component by default, 
// server component if I explicitly opt for SSR with getServerSideProps/getStaticPaths/getStaticProps
import Layout from "../../../../../pagesLayouts/Layout";
import { SERVER_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../../../pagesLayouts/layout-title";
import { TaskWithSwrPage } from '@/views/Task/use-server/taskWithSwrPage';

export default async function AppRouterUseServerTaskList() {
  return (
    <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>
      <TaskWithSwrPage />
      <br/>
    </Layout>
  );
}