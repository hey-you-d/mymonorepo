import Layout from '../../../components/Layout';
import { TaskApolloClientPage } from '@/app/views/taskApolloClientPage';

const BffTasksDB = () => {
  const body = (
    <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo with Apollo GraphQL">
      <TaskApolloClientPage />                 
      <br />
    </Layout>
  );
  
  return body;
};

export default BffTasksDB;