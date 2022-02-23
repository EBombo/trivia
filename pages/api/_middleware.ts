import initMiddleware from "../../lib";
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

export const middleware = async (req: NextApiRequest, res: NextApiResponse) => {
  const cors = initMiddleware(
    Cors({
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    })
  );

  await cors(req, res);
};