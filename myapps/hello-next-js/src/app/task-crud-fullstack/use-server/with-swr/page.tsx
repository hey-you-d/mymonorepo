// for reference: app router is a server component by default
// unlike the page router's page folder, which is a client component by default, unless if I use getServerSideProps/getStaticPaths/getStaticProps
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
