import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            try {
                const { title, detail } = req.body;
                const result = await db.query(
                    `INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *`,
                    [title, detail]
                );
                
                return res.status(201).json(result);
            } catch (err) {
                return res.status(500).json({ error: 'Database error' });
            }   
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);    
    }
}

export default handler;
