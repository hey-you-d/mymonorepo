"use client"
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { TASKS_API_RELATIVE_URL } from "@/lib/app/common";

// for reference: absolute URI for SSR, relative (proper) or absolute (if no choice) URI for CSR
// SSR: 'http://localhost:3000/api/tasks/v1/sql/graphql'
// CSR: '/api/tasks/v1/sql/graphql'
// for reference: can't be prepended with "/hello-next-js/" 
const apolloClient = new ApolloClient({
    uri: `${TASKS_API_RELATIVE_URL}/graphql`, 
    cache: new InMemoryCache(), // InMemoryCache setup
});
  
export default apolloClient;
