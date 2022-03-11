import React, { useGlobal, useMemo, useEffect, useState } from "reactn";
import { auth, config, firebase, firestore, hostName } from "../../../../firebase";
import { ButtonAnt } from "../../../../components/form/Button";
import { snapshotToArray } from "../../../../utils";
import { useRouter } from "next/router";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import { get } from "lodash";

const DEFAULT_RANKING_LENGTH = 5;

export const Scoreboard = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser, setAuthUser] = useGlobal("user");

  const isLastQuestion = useMemo(() => props.currentQuestionNumber >= props.questions.length, [props.lobby.game]);

  const [rankingUsers, setRankingUsers] = useState([]);

  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    if (isEmpty(rankingUsers)) return;

    if (!isLastQuestion) return;

    const saveTriviaWinners = async () => {

      const winnersLength = get(props.lobby, "settings.awards", []).length || 1;

      const winners = rankingUsers
        .slice(0, winnersLength)
        .map((user, i) => ({...user, award: props.lobby.settings?.awards?.[i]}));

      await firestore.doc(`lobbies/${props.lobby.id}`).update({
        finalStage: true,
        winners,
        updateAt: new Date(),
      });
    };

    saveTriviaWinners();

  }, [rankingUsers, isLastQuestion]);

  useEffect(() => {
    // calculates ranking
    const computeValidQuestions = async () => {
      if (isEmpty(props.lobby.game.invalidQuestions)) return;

      const canceledAnswersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`)
        .where("questionId", "in", props.lobby.game.invalidQuestions ?? []).get();

      const updateAnswerPromise = canceledAnswersSnapshot.docs.map((answerSnapshot) =>
        answerSnapshot.ref.update({
          points: 0,
        })
      );

      await Promise.all(updateAnswerPromise);
    };

    const fetchRanking = () => {
      return firestore.collection(`lobbies/${lobbyId}/answers`)
        .onSnapshot((answersSnapshot) => {
          const answers = snapshotToArray(answersSnapshot);

          const usersPointsMap = answers.reduce((acc, answer) => {
            if (!acc[answer.userId]) acc[answer.userId] = { score: 0 };

            acc[answer.userId].score += answer.points;
            if (!acc[answer.userId]?.nickname) acc[answer.userId].nickname = answer.user.nickname;
            if (!acc[answer.userId]?.id) acc[answer.userId].id = answer.user.id;

            return acc;
          }, {});

          const rankingUsers_ = sortBy(Object.entries(usersPointsMap).map((userPointMap) => ({
            userId: userPointMap[0],
            nickname: userPointMap[1].nickname,
            score: userPointMap[1].score,
          })), ["points"], ["desc"]);

          for (let i = 0; i < rankingUsers_.length; i++) {
            const rankingUser = rankingUsers_[i];

            if (rankingUser.userId === authUser.id) {
              setAuthUser({ ...authUser, score: rankingUser.score });
              setUserRank(i + 1);

              break;
            }
          }

          setRankingUsers(rankingUsers_);
        });
    }

    if (authUser.isAdmin) computeValidQuestions();

    const unSubRanking = fetchRanking();
    return () => unSubRanking && unSubRanking();
  }, []);

  const RankingItem = (user, i) => (
    <div
      key={`rankint-item-${i}`}
      className="grid grid-cols-[min-content_auto_min-content] bg-secondaryDark text-whiteLight py-4 w-full max-w-[1000px] md:mx-auto text-lg md:text-2xl my-4"
    >
      <div className={`px-5 self-center ${props.authUser?.id === user.id ? "text-success" : "text-whiteLight"}`}>{i + 1}</div>
      <div
        className={`px-4 self-center justify-self-start ${
          authUser?.id === user.id ? "text-success" : "text-whiteLight"
        }`}
      >
        { user.nickname }
      </div>
      <div className="px-4 whitespace-nowrap">{ user.score.toFixed(1) } pts</div>
    </div>
  );

  return (
    <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen overflow-auto text-center">
      <div className="min-h-[calc(100vh-50px)] flex flex-col py-5 bg-opacity-50 px-4">
        {authUser.isAdmin && !isLastQuestion && (
          <div className="mb-20 flex justify-end">
            <ButtonAnt
              color="success"
              width="200px"
              className="font-bold text-xl px-8"
              onClick={() => props.onGoToNextQuestion?.()}
            >
              Siguiente
            </ButtonAnt>
          </div>
        )}

        <div className="mb-6">{rankingUsers.slice(0, DEFAULT_RANKING_LENGTH).map((user, i) => RankingItem(user, i))}</div>

        {!authUser.isAdmin && userRank > DEFAULT_RANKING_LENGTH && (<>
          <div
            className={`
            w-full max-w-[1000px] md:mx-auto my-4 text-xl md:text-2xl text-whiteLight text-left
            after:inline-block after:w-[82%] md:after:w-[86%] after:h-[2px] after:relative after:content-[''] after:bottom-1 after:left-6 after:ml-0.5 after:bg-whiteLight`}
          >
            Tu puesto
          </div>
          {RankingItem(authUser, userRank)}
        </>)}

        {authUser.isAdmin && (
          <div className="my-6 text-center flex justify-center">
            <ButtonAnt
              color="danger"
              width="200px"
              className="inline-block font-bold text-lg px-8"
              onClick={() => props.onCloseLobby?.()}
            >
              Finalizar
            </ButtonAnt>
          </div>
        )}
      </div>
    </div>
  );
};

