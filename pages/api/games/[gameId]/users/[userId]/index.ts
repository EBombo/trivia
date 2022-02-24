import postGame from "../../../../../../src/api/games/_gameId/users/_userId/postGame.js";
import putGame from "../../../../../../src/api/games/_gameId/users/_userId/putGame";
import deleteGame from "../../../../../../src/api/games/_gameId/users/_userId/deleteGame";
import Cors from "cors";
import initMiddleware from "../../../../../../lib";
import type { NextApiRequest, NextApiResponse } from "next";

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
    case "POST":
      return await postGame(req, res);
    case "PUT":
      return await putGame(req, res);
    case "DELETE":
      return await deleteGame(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiGame;
