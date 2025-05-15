import { useRouter } from 'next/router';
import Layout from "../../../pagesLayouts/Layout";
import { TaskDetailPage } from "@/app/views/taskDetailPage";
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const BffTasksDB = ({}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const { id } = router.query;

    return (
      <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">               
          <TaskDetailPage id={Number(id)} />
          <br />
      </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}, // skip SSR, that means getTasksDBRows() is called with useEffect (CSR approach)
  };
};

export default BffTasksDB;