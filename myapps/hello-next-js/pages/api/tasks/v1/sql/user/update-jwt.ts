import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import type { UserModelType, UsersDbQueryResultType } from '@/types/Task';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
      case "PATCH" :
        try {
          const { email, jwt } = req.body;
          if (!email) return res.status(400).json({ error: 'Email is required' });
          if (!jwt) return res.status(400).json({ error: 'JWT is required' });  

          const result: { rows: UsersDbQueryResultType[] } = await db.query(`
            UPDATE users SET jwt = $2 WHERE email = $1 RETURNING *`, 
            [email, jwt]
          );

          // Check for null/undefined result (connection issues)
          if (!result || !result.rows) {
            console.error('API - Update-JWT - invalid outcome from DB query'); // Log detailed error  
            return res.status(500).json({ error: 'API - Update-JWT - invalid outcome from DB query' });
          }
          const rows = result.rows;
          const payload: UserModelType = rows.length > 0 && rows[0].email === email ? {
            email: rows[0].email, 
            jwt: rows[0].jwt,
            error: false, 
            message: "JWT update operation is succesful"
          } : {
            error: true, 
            message: "failed updating JWT on the DB level"
          };
          
          return res.status(201).json(payload);
        } catch (err) {
          console.error('User Registration - Database related error: ', err); // Log detailed error
          return res.status(500).json({ error: 'User Registration - Database related error' });
        }
      default:
        res.setHeader('Allow', ['PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
