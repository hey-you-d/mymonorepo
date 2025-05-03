import { useRouter } from 'next/router';
import Layout from "../../../components/Layout";
import { TaskDetailPage } from "@/app/views/taskDetailPage";
import { GetServerSideProps } from 'next';
import { SWRConfig } from 'swr';
import { Task } from '@/app/types/Task';

type Props = {
  fallback: Record<string, Task[]>;
};

const BffTasksDB = ({ fallback }: Props) => {
    const router = useRouter();
    const { id } = router.query;

    return (
        <SWRConfig value={{ fallback }}> 
          <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">               
              <TaskDetailPage id={Number(id)} />
              <br />
          </Layout>
        </SWRConfig>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Dev note: A workaround to retain the getServerSideProps In case the taskModel.getTasksDBRows() is 
  // called within the useEffect in the react hook (viewmodel component), hence 
  // demonstrating CSR instead of SSR data fetching
  return {
    props: {
      fallback: {
        'Tasks-API': [],
      },
    },
  };
};

export default BffTasksDB;