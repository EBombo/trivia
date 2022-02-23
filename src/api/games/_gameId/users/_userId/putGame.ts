import { firestore } from "../../../../../firebase";
import { snapshotToArray } from "../../../../../utils";
import type { NextApiRequest, NextApiResponse } from "next";

const putGame = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { gameId, userId } = req.query;
    const game = req.body;

    let options = null;

    if (!game.isLive) options = [...game.options];

    delete game.options;

    await firestore.doc(`games/${gameId}`).update({
      ...game,
      updateAt: new Date(),
    });

    if (options) {
      const oldOptionsQuery = await firestore.collection("games").doc(gameId).collection("options").get();

      const oldOptions = snapshotToArray(oldOptionsQuery);

      oldOptions.map(
        async (option) => await firestore.collection("games").doc(gameId).collection("options").doc(option.id).delete()
      );

      options.map(async (option) => {
        const optionId = firestore.collection("games").doc(gameId).collection("options").doc().id;

        await firestore.doc(`games/${gameId}`).collection("options").doc(optionId).set({ option, id: optionId });
      });
    }

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error?.message ?? "Something went wrong" });
  }
};

export default putGame;
