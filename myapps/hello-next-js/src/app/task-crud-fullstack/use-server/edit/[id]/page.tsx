// for reference: app router - this is a server component by default
// unlike the page router's page folder - client component by default, 
// server component if I explicitly opt for SSR with getServerSideProps/getStaticPaths/getStaticProps
import Link from 'next/link';
import Layout from "../../../../../../pagesLayouts/Layout";
import { SERVER_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../../../../pagesLayouts/layout-title";
import { TaskDetailPage } from "@/views/Task/use-server/taskDetailPage";
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';
import type { AppRouterPageProps as Props } from '@/types/Task';

// const TaskDetailNextJSPage = ({ params }: { params: { id: string } }) => {
// for reference:
// it seems typescript confuses the params (a reserved app router keyword) with an unknown Promise object
// so, here's a workaround to bypass typescript error:
const TaskDetailNextJSPage = (props: unknown) => {
    const confusedTS: Props = props as unknown as Props;
    const id = confusedTS.params.id;
    const from = confusedTS.searchParams?.from ?? "";

    return (
      <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>               
          {id ? <TaskDetailPage id={Number(id)} /> : <p>Huh? this page doesn&#39;t exist</p>}
          <Link href={!Array.isArray(from) && from.length > 0 ? from : `${MONOREPO_PREFIX}${TASKS_CRUD}/use-server`}>Back to the table page</Link>
          <br />
      </Layout>
    );
}

export default TaskDetailNextJSPage;
