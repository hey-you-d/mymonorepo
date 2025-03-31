import { UserPage } from "@/app/views/userPage";
import Layout from '../components/Layout';

const AxiosFetchMVVM = () => {
    return ( 
        <Layout title="hello-next-js - MVVM pattern example - fetch with Axios">
            <UserPage userId="1" />
            <br />
        </Layout>    
    );
}

export default AxiosFetchMVVM;