# hello-next-js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## URLs
- Prod: [https://www.yudimankwanmas.com/hello-next-js](https://www.yudimankwanmas.com/hello-next-js)
- Dev:  [https://dev.yudimankwanmas.com/hello-next-js](https://dev.yudimankwanmas.com/hello-next-js)

## Getting Started

To run the development server:
```bash
yarn workspace hello-next-js dev
```
To run the production ready build:
```bash
yarn workspace hello-next-js build
#followed by
yarn workspace hello-next-js start
```
To run the test suite
```bash
yarn workspace hello-next-js test
```
To run the linter
```bash
yarn workspace hello-next-js lint
```

## BFF (Backend for Frontend) Demo

### RESTFul API demo
Covered Tech Stacks:
- Backend framework: Next.JS API
- RDBMS: PostgreSQL
- Query Language: SQL and GraphQL
- Authentication: JWT-based auth
- Client-side Caching: SWR or React  Query
- Server-side Caching: Redis 
- Documentation: Swagger
- Unit Test: Jest

#### Localhost demo
- **LOCALHOST URL:** [http://localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)
- **Build with:** 
```bash
yarn workspace hello-next-js dev
```
- **STATUS: WIP**
1. Core API Endpoint implementation - **STATUS: DONE**
2. Barebones frontend implementation with unit test - **STATUS: DONE** - URL: [localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)
3. API Authentication with JWT-based auth - **STATUS: TODO**
4. API Authorization (role-based access control (RBAC) or attribute-based access (ABAC)) - **STATUS: TODO**
4. Client-side Caching implementation with SWR - **STATUS: DONE** - module: [https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTasksViewModelWithSwr.ts](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/src/app/viewModels/useTasksViewModelWithSwr.ts)
5. Server-side Caching implementation with Redis - **STATUS: TODO** 
6. Swagger Doc integration - **STATUS: DONE** - URL: [http://localhost:3000/hello-next-js/bff-tasks-db/swagger](http://localhost:3000/hello-next-js/bff-tasks-db/swagger) 
7. Apollo GraphQL to consume the API - **STATUS: TODO**
8. A feature relying an event-driven system using Apache Kafka - **STATUS: TO DO**

#### Remote site demo (Prod & Dev branches)
- **Prod URL:** [https://www.yudimankwanmas.com/hello-next-js/bff-tasks-db](https://www.yudimankwanmas.com/hello-next-js/bff-tasks-db) 
- **Dev URL:** [https://dev.yudimankwanmas.com/hello-next-js/bff-tasks-db](https://dev.yudimankwanmas.com/hello-next-js/bff-tasks-db)
- **STATUS: NOT READY**
Will commence after the localhost development is complete.
Point of consideration for PROD build: 
1. Determine the remote RDBMS (Candidate: AWS RDS or Supabase)
2. Set CORS to expose the API for external use (e.g hello-react-js as the client)
3. Redis based rate limiting as a protection layer. 
4. Secure Networking (HTTPS + ALB)

### Steps to set up the localhost DB for the Tasks API demo
1. For DEV env sql db, Use Docker - Quick, isolated, no OS clutter. To build & run postgres db from scratch (internet connection is needed) 
```bash
docker run --name hellonextjs-postgresdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tasks-db -p 5432:5432 -d postgres
```
2. Install the Postgresql-client
```bash
#For Linux ubuntu
sudo apt update
#followed by
sudo apt install postgresql-client
```
3. To interact with the database via the postgresql-client
```bash
psql -U postgres -d tasks-db -h localhost
```

4. Create a table via the postgresql-client
```bash
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL COLLATE "en_US.utf8",
  detail TEXT NOT NULL COLLATE "en_US.utf8",
  completed BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. To kickstart the db for localhost development (no need to redo step 1)
```bash
docker start hellonextjs-postgresdb
```

6. run the dev build of hello-next-js
```bash
yarn workspace hello-next-js dev
```

7. The URL: [localhost:3000/hello-next-js/bff-tasks-db](http://localhost:3000/hello-next-js/bff-tasks-db)

8. The Swagger Doc URL: [http://localhost:3000/hello-next-js/bff-tasks-db/swagger](http://localhost:3000/hello-next-js/bff-tasks-db/swagger) 