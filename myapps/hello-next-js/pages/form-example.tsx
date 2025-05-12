import Layout from '../components/Layout';
import { FormExamplePage, GenericFormExamplePage } from '@/app/views/formExamplePage';

const FormExample = () => {
    return ( 
        <Layout title="hello-next-js - Form Examples">
            <h2>With React&#39;s useActionState</h2>
            <FormExamplePage />
            <br/>
            <h2>Generic React form</h2>
            <GenericFormExamplePage />
            <br />
        </Layout>
    );
}

export default FormExample;