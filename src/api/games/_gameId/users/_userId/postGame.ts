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
    const { userId } = req.query as { [key: string]: string };
    const game = req.body;

    let questions = game.questions;

    delete game.questions;

    await firestore
      .collection("games")
      .doc(game.id)
      .set({
        ...game,
        usersIds: [userId],
        createAt: new Date(),
        updateAt: new Date(),
        deleted: false,
      });

    const questionsPromises = questions.map(async (question: Question) => {
      console.log(question);
      await firestore
        .collection("games")
        .doc(game.id)
        .collection("questions")
        .doc(question.id)
        .set({
          ...question,
          createAt: new Date(),
          updateAt: new Date(),
          deleted: false,
        });
    });

    await Promise.all(questionsPromises);

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export default postGame;
