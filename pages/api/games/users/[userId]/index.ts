import getGames from "../../../../../src/api/games/users/_userId/getGames";
import type { NextApiRequest, NextApiResponse } from "next";

const apiGame = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getGames(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiGame;
