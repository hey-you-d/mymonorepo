import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';
import { CHECK_BFF_AUTHORIZATION } from '../../../../../global/common';

const tasks = [
    { title: 'Build Next.js CRUD', detail: 'Add full backend API layer to hello-next-js app' },
    { title: 'Caching - Frontend', detail: 'useSWR, or React Query, or Next.js middleware' },
    { title: 'Caching - Backend', detail: 'in-memory (dev db), or redis cache (prod db)' },
    { title: 'Deal with CORS', detail: 'restrict to specific domain' },
    { title: 'Implement Authentication', detail: 'use API key, no need JWT for now' },
    { title: 'Implement Authorization', detail: 'Limit what users can access' },
    { title: 'HTTPS', detail: 'Handled by AWS Copilot + ACM' },
    { title: 'Implement rate limiting', detail: 'protect from abuse with Redis-based rate limiting' },
    { title: 'API Key Mgmt', detail: 'optional - issue API keys, for public API integrations (like partner web apps)' },
    { title: 'Private Networking', detail: 'optional - use a private VPC + internal load balancer setup in Copilot' },
];
    
export const values = tasks.flatMap(t => [t.title, t.detail]);
// DEV NOTE: expected output of the placeholders var:
// '($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ... '
export const placeholders = tasks
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(', ');

/**
 * @swagger
 * /api/tasks/v1/sql/seed-table:
 *   post:
 *     summary: insert hardcoded task items into the database 
 *     tags:
 *       - Tasks
 *     responses:
 *       201:
 *         description: The newly added Task items from a hardcoded data 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       500:
 *         description: database error
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await CHECK_BFF_AUTHORIZATION(req, res);
    
    switch (req.method) {
        case "POST" :
            try { 
                await db.query(
                    `INSERT INTO tasks (title, detail) VALUES ${placeholders}`,
                    values
                );
                const result = await db.query(
                    "SELECT * FROM tasks ORDER BY id DESC;"
                );
                
                return res.status(201).json(result);
            } catch (err) {
                console.error('Database error:', err); // Log detailed error
                return res.status(500).json({ error: 'Database error' });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);    
    }
}

export default handler;
