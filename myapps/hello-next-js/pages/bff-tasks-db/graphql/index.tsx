import Layout from '../../../components/Layout';
import { TaskGraphQLPage } from '@/app/views/taskGraphQLPage';

const BffTasksDB = () => {
  const body = (
    <Layout title="hello-next-js - Next.JS API - Backend For Frontend (BFF) demo with Apollo GraphQL">
      <TaskGraphQLPage />                 
      <br />
    </Layout>
  );
  
  return body;
};

export default BffTasksDB;
