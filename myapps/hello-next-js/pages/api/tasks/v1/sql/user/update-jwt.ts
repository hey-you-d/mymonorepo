import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import type { UserModelType, UsersDbQueryResultType } from '@/types/Task';
import { customResponseMessage, missingParamErrorMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | user/update-jwt.ts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ 
      error: await customResponseMessage(fnSignature, "handler", "Unauthorized access: invalid API key"),
    });  

    switch (req.method) {
      case "PATCH" :
        try {
          const { email, jwt } = req.body;
          if (!email) return res.status(400).json({ 
            error: await missingParamErrorMessage(fnSignature, "PATCH", "Title is required"),
          });
          if (!jwt) return res.status(400).json({ 
            error: await missingParamErrorMessage(fnSignature, "PATCH", "JWT is required"), 
          });  

          const result: { rows: UsersDbQueryResultType[] } = await db.query(`
            UPDATE users SET jwt = $2 WHERE email = $1 RETURNING *`, 
            [email, jwt]
          );

          // Check for null/undefined result (connection issues)
          if (!result || !result.rows) {
            const errMsg = await customResponseMessage(fnSignature, "PATCH", "null/undefined result");  
            return res.status(500).json(errMsg);
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
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "POST", error as Error);
          return res.status(500).json({ error: errorMsg });
        }
      default:
        res.setHeader('Allow', ['PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
