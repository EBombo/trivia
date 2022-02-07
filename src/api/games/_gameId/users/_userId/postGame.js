import {firestore} from "../../../../../firebase";

const postGame = async (req, res) => {
  try {
    const { userId } = req.query;
    const game = req.body;

    let options = null;

    if (!game.isLive) options = [...game.options];

    delete game.options;

    const gamesRef = firestore.collection("games");
    const gameId = game.id;

    await gamesRef.doc(gameId).set({
      ...game,
      id: gameId,
      usersIds: [userId],
      createAt: new Date(),
      updateAt: new Date(),
      deleted: false,
    });

    if (options) {
      options.map(async (option) => {
        const optionId = firestore.collection("games").doc(gameId).collection("options").doc().id;

        await gamesRef.doc(gameId).collection("options").doc(optionId).set({ option, id: optionId });
      });
    }

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error?.message ?? "Something went wrong" });
  }
};

export default postGame;
