import postGame from "../../../../../../src/api/games/_gameId/users/_userId/postGame";
import putGame from "../../../../../../src/api/games/_gameId/users/_userId/putGame";
import deleteGame from "../../../../../../src/api/games/_gameId/users/_userId/deleteGame";
import type { NextApiRequest, NextApiResponse } from "next";

const apiGame = async (req: NextApiRequest, res: NextApiResponse) => {

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
