import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import type { UserModelType, UsersDbQueryResultType } from '@/types/Task';
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | user/lookup.ts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ 
      error: await customResponseMessage(fnSignature, "handler", "Unauthorized access: invalid API key"),
    });

    switch (req.method) {
      case "POST" :
        try {
          const { email } = req.body;
 
          const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
          
          // Check for null/undefined result (connection issues)
          if (!result.rows) {
            const errMsg = await customResponseMessage(fnSignature, "POST", "null/undefined result");  
            return res.status(500).json({ error: errMsg });
          }

          if (result.rows.length > 0 && 'error' in result.rows[0]) {
            const errMsg = await customResponseMessage(fnSignature, "POST", "db query returns GenericStringError");  
            return res.status(500).json({ error: errMsg });
          }
      
          const typeCastedRows = result.rows as UsersDbQueryResultType[];
          const payload: UserModelType = result.rows != null && result.rows.length > 0 && result.rows[0].email === email ? {
            email: typeCastedRows[0].email, 
            password: typeCastedRows[0].hashed_pwd, 
            jwt: typeCastedRows[0].jwt,
            admin: typeCastedRows[0].admin_access,
            error: false, 
            message: "successful email lookup"
          } : {
            error: true, 
            message: "provided email does not exist in the db"
          };
          
          return res.status(201).json(payload);
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "POST", error as Error);
          return res.status(500).json({ error: errorMsg });
        }
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
