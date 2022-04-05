import { firestore } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
import orderBy from "lodash/orderBy";
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

type User = {
  id: string;
  nickname: string;
};

export const computeRanking = (users: User[], answers: Answer[], invalidQuestions: string[] = []): RankUser[] => {
  // initialize all users for ranking
  let usersPointsMap = users.reduce((acc, user) => {
    acc[user.id] = { id: user.id, nickname: user.nickname, score: 0 };

    return acc;
  }, {} as { [key: string]: any });

  // calculates score from valid answers
  usersPointsMap = answers.reduce((acc, answer) => {
    // if answer has a non-existent user
    if (!acc[answer.userId]) acc[answer.userId] = { id: answer?.userId, nickname: answer?.user?.nickname, score: 0 };

    if (!invalidQuestions.includes(answer.questionId)) acc[answer.userId].score += answer.points;

    return acc;
  }, usersPointsMap);

  // sort
  const rankingUsers_: RankUser[] = orderBy(
    Object.entries(usersPointsMap).map((userPointMap) => ({
      userId: userPointMap[0],
      nickname: userPointMap[1]?.nickname,
      score: userPointMap[1]?.score,
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

    const answersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`).get();

    const usersSnapshot = await firestore.collection(`lobbies/${lobbyId}/users`).get();
    const usersSize = usersSnapshot.size;
    const users = snapshotToArray(usersSnapshot);

    const lobbySnapshot = await firestore.doc(`lobbies/${lobbyId}`).get();
    const lobby = lobbySnapshot.data();
    const invalidQuestions = lobby?.game?.invalidQuestions || [];

    const answers = snapshotToArray(answersSnapshot);

    const usersRanking = computeRanking(users, answers, invalidQuestions);

    const updateRankingListPromise = usersRanking.map((rankingUser) =>
      firestore.collection(`lobbies/${lobbyId}/ranking`).doc(rankingUser.userId).set(rankingUser, { merge: true })
    );

    const updateUserScoringListPromise = usersRanking.map((rankingUser) =>
      firestore
        .collection(`lobbies/${lobbyId}/users`)
        .doc(rankingUser.userId)
        .update({ rank: rankingUser.rank, score: rankingUser.score })
    );

    const updateLobbyPromise = firestore.doc(`lobbies/${lobbyId}`).update({
      playersCount: usersSize,
    });

    await Promise.allSettled([...updateRankingListPromise, ...updateUserScoringListPromise, updateLobbyPromise]);

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export default putRanking;
