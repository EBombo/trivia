import { firestore } from "../../../../../firebase";
import type { NextApiRequest, NextApiResponse } from "next";

const deleteGame = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { gameId } = req.query;

    await firestore.doc(`games/${gameId}`).update({
      deleted: true,
      updateAt: new Date(),
    });

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export default deleteGame;
