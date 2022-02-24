import { firestore } from "../../../../../firebase";
import type { NextApiRequest, NextApiResponse } from "next";

type Question = {
  id: string;
  options?: string[];
  answer: number | string | string[];
  time: number;
  type: string;
};

const postGame = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;
    const game = req.body;

    let questions = game.questions;

    delete game.questions;

    const gamesRef = firestore.collection("games");
    const gameId = game.id;
    console.log('>>> my questions', questions);

    await gamesRef.doc(gameId).set({
      ...game,
      id: gameId,
      usersIds: [userId],
      createAt: new Date(),
      updateAt: new Date(),
      deleted: false,
    });

    let promises = questions.map((question: Question) =>
      gamesRef
        .doc(gameId)
        .collection("questions")
        .doc(question.id)
        .set({
          ...question,
          usersIds: [userId],
          createAt: new Date(),
          updateAt: new Date(),
          deleted: false,
        })
    );
    Promise.all(promises);

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export default postGame;
