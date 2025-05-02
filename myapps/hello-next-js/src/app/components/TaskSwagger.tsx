import dynamic from 'next/dynamic';
// Dev note: This swagger-ui-react import will cause SSR to try loading the module
// By importing swagger-ui-react eagerly at the top, it defeats the purpose of dynamic() with ssr: false. 
// By the time dynamic() is called, the module has already been evaluated, 
// which may cause window is not defined or similar errors during SSR.
//import SwaggerUI from 'swagger-ui-react'; 
import 'swagger-ui-react/swagger-ui.css';
import { TASKS_BFF_BASE_API_URL } from "../../../constants/tasksBff";

// Dev note: have to use the dynamic import because swagger-ui-react depends on browser-only APIs
// It uses window, document, and other DOM APIs that don’t exist in the Node.js runtime.
// Next.js by default tries to render pages server-side — which fails when trying to render components that depend on the DOM.
// Without ssr: false, you'll likely see this kind of error: ReferenceError: window is not defined
// dynamic(..., { ssr: false }) tells Next.js to render this component on the client-side only.
// This ensures:
// 1. The Swagger UI loads after hydration
// 2. You avoid SSR-related runtime errors
const SwaggerDoc = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
  return <SwaggerDoc url={`${TASKS_BFF_BASE_API_URL}/swagger`} />;
}
