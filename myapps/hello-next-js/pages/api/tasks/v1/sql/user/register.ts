import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { UsersDbQueryResultType } from '@/types/Task';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
      case "POST" :
        try {
          const { email, password, jwt } = req.body;
          if (!email) return res.status(400).json({ error: 'Email is required' });
          if (!password) return res.status(400).json({ error: 'Hashed Password is required' });
          if (!jwt) return res.status(400).json({ error: 'JWT is required' });  
          
          const { rows } : { rows: UsersDbQueryResultType[] } = await db.query(`
            INSERT INTO users (email, hashed_pwd, auth_type, admin_access, jwt) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
            [email, password, "basic_auth", false, jwt]
          );

          const payload = rows.length > 0 && rows[0].email === email ? {
            email: rows[0].email, 
            password: rows[0].hashed_pwd, 
            jwt: rows[0].jwt,
            admin: rows[0].admin_access,
            error: false, 
            message: "successful user registration"
          } : {
            error: true, 
            message: "failed user registration on the DB level"
          };
          
          return res.status(201).json(payload);   
        } catch (err) {
          console.error('User Registration - Database related error: ', err); // Log detailed error
          return res.status(500).json({ error: 'User Registration - Database related error' });
        }
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
