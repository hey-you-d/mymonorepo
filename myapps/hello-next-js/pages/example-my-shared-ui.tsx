import Layout from '../pagesLayouts/Layout';
import { ExampleComponent } from 'my-shared-ui'

const ExampleMySharedUi = () => {
    return ( 
        <Layout title="hello-next-js - Shared Library example - my-shared-ui">
            <ExampleComponent text="This React component is defined in the My-Shared-UI package" />
            <br />
        </Layout>
    );
}

export default ExampleMySharedUi;