INSERT INTO tasks (title, detail)
VALUES 
    ('Build Next.js CRUD', 'Add full backend API layer to hello-next-js app'),
    ('Caching - Frontend', 'useSWR, or React Query, or Next.js middleware'),
    ('Caching - Backend', 'in-memory (dev db), or redis cache (prod db)')
    ('Deal with CORS', 'restrict to specific domain'),
    ('Implement Authentication', 'use API key, no need JWT for now'),
    ('Implement Authorization', 'Limit what users can access'),
    ('HTTPS', 'Handled by AWS Copilot + ACM'),
    ('Implement rate limiting', 'protect from abuse with Redis-based rate limiting'),
    ('API Key Mgmt', 'optional - issue API keys, for public API integrations (like partner web apps)'),
    ('Private Networking', 'optional - use a private VPC + internal load balancer setup in Copilot');   

-- username: admin@guy.com , password: 1234567
INSERT INTO users (email, hashed_pwd, auth_type, admin_access, jwt)
VALUES (
    'admin@guy.com', 
    '$argon2id$v=19$m=65536,t=5,p=1$Q3mQEKY6fT8ECMDWYRTfeA$uiHc/ijlO7mPlkk7KjiqBF+zu3LrSSkrO2U4Fund8CA', 
    'basic_auth',
    TRUE,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAbm90ZXhpc3QuY29tIiwiaGFzaGVkUGFzc3dvcmQiOiIkYXJnb24yaWQkdj0xOSRtPTY1NTM2LHQ9NSxwPTEkeUtVVGp4Z2ZwSXB6NjhnT1EzYU5ZQSRjVWliSmMyR2V5UDVoOWJRU05kV3dHUlZUcmVKS0Q0YTUwcW02bktQK3EwIiwiaWF0IjoxNzQ4ODI2MDU5LCJleHAiOjE3NDg4Mjk2NTl9.HqBZvMiCq0S6XDbPu8dZJMWA3s6zx5cqGaTjLpUeHLM'
)
ON CONFLICT (email) DO NOTHING;