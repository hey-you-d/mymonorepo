import type { NextApiRequest, NextApiResponse } from 'next';
import { tasks, Task } from '@/bff/tasks/db_inMemory';
import { v4 as uuidv4 } from 'uuid';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET" :
        res.status(200).json(tasks);

        break;
    case "POST" :
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const newTask: Task = {
            id: uuidv4(),
            title,
            completed: false,
        };

        tasks.push(newTask);
        res.status(201).json(newTask);  

        break;  
    default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
  }
}

export default handler;
