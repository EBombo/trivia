import initMiddleware from "../../lib";
import Cors from "cors";

export const middleware = async (req, res) => {
  const cors = initMiddleware(
    Cors({
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    })
  );

  await cors(req, res);
};
