import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { customResponseMessage, missingParamErrorMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | index.ts";

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *            type: integer
 *         title:
 *            type: string
 *         detail:
 *            type: string
 *         completed:
 *            type: boolean
 *         created_at:
 *            type: string
 *            format: date-time
 * /api/tasks/v1/sql:
 *   get:
 *     summary: Get all tasks from the DB
 *     tags:
 *       - Tasks
 *     responses:
 *       500:
 *         description: database error
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Add a task into the DB
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       400:
 *         description: title is required
 *       500:
 *         description: database error
 *       201:
 *         description: The newly created Task item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    // TODO: investigate -  a single "Unauthorized access: invalid API key" that popped up ended up being a false alarm
    //console.log("before isAuthorized ", req.headers["x-api-key"], " " , isAuthorized);
    if (!isAuthorized) return res.status(401).json({ 
      error: await customResponseMessage(fnSignature, "handler", "Unauthorized access: invalid API key"),
    });

    switch (req.method) {
      case "GET" :
        try {
          const result = await db.query('SELECT * FROM tasks ORDER BY id DESC');
        
          return res.status(200).json(result.rows);
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "GET", error as Error);
          return res.status(500).json({ error: errorMsg });
        } 
      case "POST" :
        try {
          const { title } = req.body;
          if (!title) return res.status(400).json(
              { error: await missingParamErrorMessage(fnSignature, "POST", "Title is required"), }
          );

          const result = await db.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
          
          return res.status(201).json(result.rows[0]);
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "POST", error as Error);
          return res.status(500).json({ error: errorMsg });
        } 
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
