import type { NextApiRequest, NextApiResponse } from 'next';
//import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
      case "GET" :
        try {
          /*
          const { rows } = await db.query('SELECT * FROM users ORDER BY id DESC');
          return res.status(200).json(rows);
          */
            
          return res.status(201).json(JSON.stringify(
            { 
                email: "yudiman@kwanmas.com", password: "123", jwt: "456", error: false, message: "successful GET" 
            }
          ));
        } catch (err) {
          console.error('Database error:', err); // Log detailed error
          return res.status(500).json({ error: 'Database error' });
        }  
      case "POST" :
        try {
          const { email, password, jwt } = req.body;
          if (!email) return res.status(400).json({ error: 'Email is required' });
          if (!password) return res.status(400).json({ error: 'Hashed Password is required' });
          if (!jwt) return res.status(400).json({ error: 'JWT is required' });  
          
          /*
          const result = await db.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
          return res.status(201).json(result.rows[0]);
          */

          return res.status(201).json(JSON.stringify(
            { 
                email, password, jwt, error: false, message: "successful POST" 
            }
          ));     
        } catch (err) {
          console.error('Database error:', err); // Log detailed error
          return res.status(500).json({ error: 'Database error' });
        }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
