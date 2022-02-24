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
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  await cors(req, res);
};

export default handler;
