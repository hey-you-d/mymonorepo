// for reference: app router - this is a server component by default
// unlike the page router's page folder - client component by default, 
// server component if I explicitly opt for SSR with getServerSideProps/getStaticPaths/getStaticProps
import Link from 'next/link';
import Layout from "../../../../../../../pagesLayouts/Layout";
import { SERVER_SIDE_FRONTEND_LAYOUT_TITLE } from "../../../../../../../pagesLayouts/layout-title";
import { TaskDetailWithSwrPage } from "@/views/Task/use-server/taskDetailWithSwrPage";
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

// const TaskDetailNextJSPage = ({ params }: { params: { id: string } }) => {
// for reference:
// it seems typescript confuses the params (a reserved app router keyword) with an unknown Promise object
// so, here's a workaround to bypass typescript error:
const TaskDetailWithSwrNextJSPage = (props: unknown) => {
    const confusedTS: { params: { id: string } } = props as unknown as { params: { id: string } };
    const id = confusedTS.params.id;
    return id 
      ? (
        <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>               
            <TaskDetailWithSwrPage id={Number(id)} />
            <br />
        </Layout>
      ) : (
        <Layout title={SERVER_SIDE_FRONTEND_LAYOUT_TITLE}>               
            <p>Huh? this page doesn&#39;t exist</p>
            <Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server/with-swr`}>Back to the table page (with SWR)</Link>
            <br />
        </Layout>
      );
}

export default TaskDetailWithSwrNextJSPage;
