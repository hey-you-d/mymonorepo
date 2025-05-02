export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Next.js MVVM CRUD API',
      version: '1.0.0',
      description: 'A simple CRUD API using Next.js MVVM architecture',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server (localhost)',
      },
    ],
  };
  
  export const swaggerOptions = {
    swaggerDefinition,
    apis: ['./pages/api/**/*.ts'],
  };
  