import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { TaskDetailPage } from '@/app/views/taskDetailPage';


const BffTasksDB = () => {
    const router = useRouter();
    const { id } = router.query; // id is now available

    return ( 
        <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">               
            <TaskDetailPage id={id} />
            <br />
        </Layout>
    );
}

export default BffTasksDB;