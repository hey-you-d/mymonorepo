import React from 'react';
import { UserPage } from "@/app/views/userPage";

const About = () => {
    return ( 
        <>
            <h1>this is the hello-next-js About page</h1>
            <UserPage userId="1" />
        </>
    );
}

export default About;