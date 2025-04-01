import Layout from '../components/Layout';
import ReduxSagaExamplePage from '@/app/views/reduxSagaExamplePage';

const ExampleReduxSaga = () => {
    return ( 
        <Layout title="hello-next-js - MVVM pattern example - Redux Saga">
            <ReduxSagaExamplePage />
        </Layout>
    );
}

export default ExampleReduxSaga;