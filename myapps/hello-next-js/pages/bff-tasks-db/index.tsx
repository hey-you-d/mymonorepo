import Layout from '../../components/Layout';
import { TaskPage } from '@/app/views/taskPage';

const BffTasksDB = () => {
    return ( 
        <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo">
            <TaskPage />                 
            <br />
        </Layout>
    );
}

export default BffTasksDB;
