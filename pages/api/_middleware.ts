import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const initMiddleware = (middleware) => (req, res) =>
  new Promise((resolve, reject) =>
    middleware(req, res, (result) => {
      if (result instanceof Error) return reject(result);

      return resolve(result);
    })
  );

const cors = initMiddleware(
  Cors({
    origin: ["http://localhost:3001", "https://ebombo.com", "https://red.ebombo.com/"],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

export const middleware = async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  await cors(req, res);
};
