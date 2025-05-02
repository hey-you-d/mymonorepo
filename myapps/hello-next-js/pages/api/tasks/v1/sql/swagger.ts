import { NextApiRequest, NextApiResponse } from "next";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "@/bff/tasks/swaggerConfig";

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(swaggerSpec);
}
