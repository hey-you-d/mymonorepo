import path from 'path';

const serversConfig = {
  url: 'http://localhost:3000',
  description: 'Development server (localhost)',
};

export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Tasks API',
      version: '1.0.0',
      description: 'A simple CRUD API using Next.js API feature',
    },
    servers: [serversConfig],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
    security: [{
      ApiKeyAuth: [],
    },],
  };

export const swaggerOptions = {
  swaggerDefinition,
  apis: [path.resolve(process.cwd(), 'pages/api/tasks/v1/sql/*.ts')],
};
  