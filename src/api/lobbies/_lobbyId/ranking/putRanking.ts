import { firestore } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
import sortBy from "lodash/sortBy";
import type { NextApiRequest, NextApiResponse } from "next";

type AnswerUser = {
  id: string;
  nickname: string;
};

type Answer = {
  answer: string;
  createAt: any;
  updateAt: any;
  points: number;
  questionId: string;
  questionNumber: number;
  questionTime: number;
  secondsLeft: number;
  userId: string;
  user: AnswerUser;
};

type RankUser = {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
};

const computeRanking = (answers: Answer[], invalidQuestions: string[] = []): RankUser[] => {
  const usersPointsMap = answers.reduce((acc, answer) => {
    if (!acc[answer.userId]) acc[answer.userId] = { score: 0 };

    if (!invalidQuestions.includes(answer.questionId)) acc[answer.userId].score += answer.points;

    if (!acc[answer.userId]?.nickname) acc[answer.userId].nickname = answer.user.nickname;
    if (!acc[answer.userId]?.id) acc[answer.userId].id = answer.user.id;

    return acc;
  }, {} as { [key: string]: any });

  const rankingUsers_: RankUser[] = sortBy(
    Object.entries(usersPointsMap).map((userPointMap) => ({
      userId: userPointMap[0],
      nickname: userPointMap[1].nickname,
      score: userPointMap[1].score,
      rank: 0,
    })),
    ["score"],
    ["desc"]
  ).map((userRank, i) => ({ ...userRank, rank: i + 1 }));

  return rankingUsers_;
};

const putRanking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId } = req.query as { [key: string]: string };
    console.log(`>>> lobbyId ${lobbyId}`);

    const answersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`).get();

    const lobbySnapshot = await firestore.doc(`lobbies/${lobbyId}`).get();
    const lobby = lobbySnapshot.data();
    const invalidQuestions = lobby?.game?.invalidQuestions || [];

    const answers = snapshotToArray(answersSnapshot);

    const usersRanking = computeRanking(answers, invalidQuestions);

    const updateRankingListPromise = usersRanking.map((rankingUser) =>
      firestore.collection(`lobbies/${lobbyId}/ranking`).doc(rankingUser.userId).set(rankingUser, { merge: true })
    );

    const updateUserScoringListPromise = usersRanking.map((rankingUser) =>
      firestore
        .collection(`lobbies/${lobbyId}/users`)
        .doc(rankingUser.userId)
        .update({ rank: rankingUser.rank, score: rankingUser.score })
    );

    await Promise.all([...updateRankingListPromise, ...updateUserScoringListPromise]);

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export default putRanking;
