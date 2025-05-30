import type { NextApiRequest, NextApiResponse } from 'next';
//import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
      case "POST" :
        try {
          /*
          const { rows } = await db.query('SELECT * FROM users ORDER BY id DESC');
          return res.status(200).json(rows);
          */
            
          return res.status(201).json(
            { 
                email: "yudiman@kwanmas.com", 
                password: "$argon2id$v=19$m=65536,t=5,p=1$Q3mQEKY6fT8ECMDWYRTfeA$uiHc/ijlO7mPlkk7KjiqBF+zu3LrSSkrO2U4Fund8CA", 
                jwt: "abcdefg", 
                error: false, 
                message: "successful email lookup" 
            }
          );
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
