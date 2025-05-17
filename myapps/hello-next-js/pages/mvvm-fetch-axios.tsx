import { UserPage } from "@/views/userPage";
import Layout from '../pagesLayouts/Layout';

const AxiosFetchMVVM = () => {
    return ( 
        <Layout title="hello-next-js - MVVM pattern example - fetch with Axios">
            <UserPage userId="1" />
            <br />
        </Layout>    
    );
}

export default AxiosFetchMVVM;