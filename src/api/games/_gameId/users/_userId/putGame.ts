import { firestore } from "../../../../../firebase";
import { snapshotToArray } from "../../../../../utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Question = {
  id: string;
  options?: string[];
  answer: number | string | string[];
  time: number;
  type: string;
};

const putGame = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { gameId, userId } = req.query as { [key: string]: string };
    const game = req.body;

    let questions = game.questions;

    delete game.questions;

    await firestore.doc(`games/${gameId}`).update({
      ...game,
      updateAt: new Date(),
    });

    const oldQuestionsQuery = await firestore.collection("games").doc(gameId).collection("questions").get();

    const oldQuestions = snapshotToArray(oldQuestionsQuery);

    oldQuestions.map(
      async (question) =>
        await firestore.collection("games").doc(gameId).collection("questions").doc(question.id).delete()
    );

    const questionsPromises = questions.map(async (question: Question, index: number) => {
      await firestore
        .doc(`games/${gameId}`)
        .collection("questions")
        .doc(question.id)
        .set({
          ...question,
          questionNumber: index + 1,
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

export default putGame;
