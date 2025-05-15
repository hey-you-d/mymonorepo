import { useRouter } from 'next/router';
import Layout from "../../../pagesLayouts/Layout";
import { CLIENT_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../pagesLayouts/layout-title";
import { TaskDetailPage } from "@/app/views/Task/from-client/taskDetailPage";

const BffTasksDB = () => {
    const router = useRouter();
    const { id } = router.query;

    return (
      <Layout title={CLIENT_SIDE_FRONTEND_LAYOUT_TITLE}>               
          <TaskDetailPage id={Number(id)} />
          <br />
      </Layout>
    );
}

export default BffTasksDB;
