import type { NextApiRequest, NextApiResponse } from 'next';
import { tasks } from '@/bff/tasks/db_inMemory';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const task = tasks[taskIndex];

  switch (req.method) {
    case 'GET':
      res.status(200).json(task);
      
      break;

    case 'PUT':
      const { title, completed } = req.body;
      tasks[taskIndex] = { ...task, title, completed };
      
      res.status(200).json(tasks[taskIndex]);
      
      break;

    case 'DELETE':
      tasks.splice(taskIndex, 1);
      
      res.status(204).end();
      
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
