import Cors from "cors";
import initMiddleware from "../../../../lib";
import { expireLobbies } from "../../../../src/api/lobbies/expire/expireLobbies";
import type { NextApiRequest, NextApiResponse } from "next";

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const apiExpireLobbies = async (req: NextApiRequest, res: NextApiResponse) => {
  // Run cors
  await cors(req, res);

  switch (req.method) {
    case "GET":
      return await expireLobbies(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiExpireLobbies;
