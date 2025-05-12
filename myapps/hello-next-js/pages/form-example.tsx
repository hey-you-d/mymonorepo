import Layout from '../components/Layout';
import { FormExamplePage } from '@/app/views/formExamplePage';

const FormExample = () => {
    return ( 
        <Layout title="hello-next-js - Form Example with useActionState">
            <FormExamplePage />
            <br />
        </Layout>
    );
}

export default FormExample;