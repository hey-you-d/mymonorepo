# MyMonorepo Side Project

## Objectives
1. Explore cloud-based serverless deployment automation (CI/CD) with AWS Copilot (Fargate launch type), dockerized container for ECR, and CI/CD implementation with Github Action 
**-- STATUS: FULFILLED**
2. Explore the current-trend of microservice architecture, and backend / server-side API development with Node.JS (Next.JS) 
**-- STATUS: WIP**
3. Explore the current-trend of microservice architecture, and backend / server-side API development with non-Node.JS based framework (candidate: .NET Core) 
**-- STATUS: TODO**   

## Infrastructure
### Tech stacks
1. Monorepo setup with yarn workspace
2. Serverless deployment with Docker, ECR, ECS, Copilot with Fargate Launch Type, ALB, CloudFormation
3. CDN Service with AWS Cloudfront
4. DNS with Cloudflare
6. CI/CD implementation with Github Action
7. Demo front-end pages/projects (as part of the monorepo setup): Next.js, React.js with Vite, React.js with CRA 

## FullStack CRUD Demo with Next.js and React.js
Setup instruction (localhost) & Work Progress Log: [README](https://github.com/hey-you-d/mymonorepo/blob/master/myapps/hello-next-js/README.md)

### Tech stacks
1. Backend framework: Next.JS ver.15 API 
2. Frontend framework: Next.JS ver.15, and React.JS ver.9 + Typescript
2. RDBMS: PostgreSQL DB
3. Data Query Language: direct SQL and via Apollo GraphQL
4. API Authentication: JWT-based auth
5. Client-side Caching: Vercel SWR (for non-graphql) and Apollo Client in-Memory cache
6. Server-side Caching: To be determined. 
7. Documentation: Swagger API Doc.
8. Unit Test: Jest Testing Framework.
9. Frontend CSS Styling: Tailwind CSS

## Links
1. [Production site - hello-react-js](https://www.yudimankwanmas.com)
2. [Production site - hello-next-js](https://www.yudimankwanmas.com/hello-next-js) 
3. [Development site - hello-react-js](https://dev.yudimankwanmas.com)
4. [Development site - hello-next-js](https://dev.yudimankwanmas.com/hello-next-js) 

## Prod Sites Availability
| Time (AEST)         | Time (UTC)         | Action     |
| :------------------ | :----------------- | :--------- |
| Mon–Fri 9 AM        | Sun–Thu 23:00 UTC  | Scale up   |
| Mon–Fri 9 PM        | Mon–Fri 11:00 UTC  | Scale down |
| Sat & Sun All Day   | Sat–Sun            | Scale down |

* Scale Down effect: will be served with 503 page **  
* Scale Up effect: the site is up and running

** If the Cloudfront CDN cache is not manually invalidated, visitors will still be able to see the cached HTML/JS/CSS. However, backend service is no longer serving the traffic.  

hint: This is done via ECS Auto Scaling Configuration in ECS Console

## Dev Sites Availability
* All dev sites are scaled down 24/7. No Load balanced web services are running when scaled down. Site visitors  will be presented with the 503 "Service is temporarily not available" page instead. 
* All dev sites will be scaled-up on an on-demand basis. 