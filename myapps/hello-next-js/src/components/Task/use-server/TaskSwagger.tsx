'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import dynamic from 'next/dynamic';
import { TASKS_SQL_BASE_API_URL } from "@/lib/app/common";

// for reference: This swagger-ui-react import will cause SSR to try loading the module
// By importing swagger-ui-react eagerly at the top, it defeats the purpose of dynamic() with ssr: false. 
// By the time dynamic() is called, the module has already been evaluated, 
// which may cause window is not defined or similar errors during SSR.
//import SwaggerUI from 'swagger-ui-react'; 
import 'swagger-ui-react/swagger-ui.css';

// for reference: have to use the dynamic import because swagger-ui-react depends on browser-only APIs
// It uses window, document, and other DOM APIs that don’t exist in the Node.js runtime.
// Next.js by default tries to render pages server-side — which fails when trying to render components that depend on the DOM.
// Without ssr: false, you'll likely see this kind of error: ReferenceError: window is not defined
// dynamic(..., { ssr: false }) tells Next.js to render this component on the client-side only.
// This ensures:
// 1. The Swagger UI loads after hydration
// 2. You avoid SSR-related runtime errors
const SwaggerDoc = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
  return <SwaggerDoc url={`${TASKS_SQL_BASE_API_URL}/swagger`} />;
}
