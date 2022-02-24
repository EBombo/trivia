import getGames from "../../../../../src/api/games/users/_userId/getGames";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import initMiddleware from "../../../../../lib";

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const apiGame = async (req: NextApiRequest, res: NextApiResponse) => {
  // Run cors
  await cors(req, res);

  switch (req.method) {
    case "GET":
      return await getGames(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiGame;
