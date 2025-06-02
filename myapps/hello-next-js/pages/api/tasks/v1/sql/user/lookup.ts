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
          const { email } = req.body;

          const { rows } : { rows: UsersDbQueryResultType[] } = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
          
          const payload = rows.length > 0 && rows[0].email === email ? {
            email: rows[0].email, 
            password: rows[0].hashed_pwd, 
            jwt: rows[0].jwt,
            admin: rows[0].admin_access,
            error: false, 
            message: "successful email lookup"
          } : {
            error: true, 
            message: "provided email does not exist in the db"
          };
          
          return res.status(201).json(payload);
        } catch (err) {
          console.error('User Login - Database related error: ', err); // Log detailed error
          return res.status(500).json({ error: 'User Login - Database related error' });
        }
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
