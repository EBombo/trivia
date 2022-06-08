import orderBy from "lodash/orderBy";
import { firestore } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
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
  // Initialize all users for ranking.
  let usersPointsMap = users.reduce((acc, user) => {
    acc[user.id] = { id: user.id, nickname: user.nickname, score: 0 };

    return acc;
  }, {} as { [key: string]: any });

  // Calculates score from valid answers.
  usersPointsMap = answers.reduce((acc, answer) => {
    // If answer has a non-existent user.
    if (!acc[answer.userId]) acc[answer.userId] = { id: answer?.userId, nickname: answer?.user?.nickname, score: 0 };

    // Accumulate score just for valid answer.
    if (!invalidQuestions.includes(answer.questionId)) acc[answer.userId].score += answer.points;

    return acc;
  }, usersPointsMap);

  // sort and return.
  return orderBy(
    Object.entries(usersPointsMap).map((userPointMap) => ({
      userId: userPointMap[0],
      nickname: userPointMap[1]?.nickname,
      score: userPointMap[1]?.score,
      rank: 0,
    })),
    ["score"],
    ["desc"]
  ).map((userRank, i) => ({ ...userRank, rank: i + 1 }));
};

const putRanking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId } = req.query as { [key: string]: string };

    const { lobby, alreadyComputed } = await checkLastRankingCompute(lobbyId);

    if (alreadyComputed) return res.send({ success: true, message: "ranking for the current question was already computed" });

    const answersPromise = fetchAnswers(lobbyId);

    const usersPromise = fetchUsers(lobbyId);

    const response = await Promise.all([answersPromise, usersPromise]);

    const answers = response[0];
    const { usersSize, users } = response[1];

    const invalidQuestions = lobby?.game?.invalidQuestions || [];

    const usersRanking = computeRanking(users, answers, invalidQuestions);

    // Create documents rankings.
    const rankingRef = firestore.collection(`lobbies/${lobbyId}/ranking`);
    const updateRankingListPromise = usersRanking.map((rankingUser) =>
      rankingRef.doc(rankingUser.userId).set(rankingUser, { merge: true })
    );

    // Update users with ranking and score.
    const usersRef = firestore.collection(`lobbies/${lobbyId}/users`);
    const updateUserScoringListPromise = usersRanking.map((rankingUser) =>
      usersRef.doc(rankingUser.userId).update({ rank: rankingUser.rank, score: rankingUser.score })
    );

    // Update lobby.
    const updateLobbyPromise = firestore.doc(`lobbies/${lobbyId}`).update({
      playersCount: usersSize,
      lastRankingComputeQuestion: lobby.game.currentQuestionNumber,
    });

    await Promise.allSettled([...updateRankingListPromise, ...updateUserScoringListPromise, updateLobbyPromise]);

    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

const fetchAnswers = async (lobbyId: string) => {
  const answersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`).get();
  return snapshotToArray(answersSnapshot);
};

const fetchUsers = async (lobbyId: string) => {
  const usersSnapshot = await firestore.collection(`lobbies/${lobbyId}/users`).get();
  const usersSize = usersSnapshot.size;
  const users = snapshotToArray(usersSnapshot);

  return { usersSize, users };
};

const fetchLobby = async (lobbyId: string) => {
  const lobbySnapshot = await firestore.doc(`lobbies/${lobbyId}`).get();
  return lobbySnapshot.data()!;
};

const checkLastRankingCompute = async (lobbyId : string) => {
  const lobby = await fetchLobby(lobbyId);

  if (!lobby.lastRankingComputeQuestion) return { lobby, alreadyComputed: false };

  if (lobby.lastRankingComputeQuestion !== lobby.game.currentQuestionNumber) return { lobby, alreadyComputed: false };

  return { lobby, alreadyComputed: true };
};

export default putRanking;
