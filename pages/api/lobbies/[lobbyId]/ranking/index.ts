import putRanking from "../../../../../src/api/lobbies/_lobbyId/ranking/putRanking";
import Cors from "cors";
import initMiddleware from "../../../../../lib";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const apiRankingLobby = async (req: NextApiRequest, res: NextApiResponse) => {
  // Run cors
  await cors(req, res);

  switch (req.method) {
    case "PUT":
      return await putRanking(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiRankingLobby;


