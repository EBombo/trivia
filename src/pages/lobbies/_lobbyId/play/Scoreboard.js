import React, { useGlobal, useMemo, useEffect, useState } from "reactn";
import { firestore } from "../../../../firebase";
import { ButtonAnt } from "../../../../components/form/Button";
import { snapshotToArray } from "../../../../utils";
import { useRouter } from "next/router";
import isEmpty from "lodash/isEmpty";
import { get } from "lodash";

const DEFAULT_RANKING_LENGTH = 5;

export const Scoreboard = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser, setAuthUser] = useGlobal("user");

  const isLastQuestion = useMemo(() => props.currentQuestionNumber >= props.questions.length, [props.lobby.game]);

  const [rankingUsers, setRankingUsers] = useState([]);

  // if last question then saves winners for LobbyClosed
  useEffect(() => {
    if (!authUser.isAdmin) return;

    if (isEmpty(rankingUsers)) return;

    if (!isLastQuestion) return;

    const saveTriviaWinners = async () => {
      const winnersLength = get(props.lobby, "settings.awards", []).length || 1;

      const winners = rankingUsers
        .slice(0, winnersLength)
        .map((user, i) => ({ ...user, award: props.lobby.settings?.awards?.[i] }));

      await firestore.doc(`lobbies/${props.lobby.id}`).update({
        finalStage: true,
        winners,
        updateAt: new Date(),
      });
    };

    saveTriviaWinners();
  }, [rankingUsers, isLastQuestion]);

  useEffect(() => {
    const fetchRanking = async () => {
      const rankingSnapshot = await firestore
        .collection(`lobbies/${lobbyId}/ranking`)
        .orderBy("rank", "asc")
        .limit(DEFAULT_RANKING_LENGTH)
        .get();

      const ranking = snapshotToArray(rankingSnapshot);

      setRankingUsers(ranking);
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    if (authUser.isAdmin) return;

    const fetchUserStats = async () => {
      const userSnapshot = await firestore.doc(`lobbies/${lobbyId}/users/${authUser.id}`).get();

      const user_ = userSnapshot.data();

      setAuthUser({ ...authUser, rank: user_.rank, score: user_.score });
    };

    fetchUserStats();
  }, []);

  const RankingItem = ({ user }) => (
    <div
      key={`rankint-item-${user?.rank}`}
      className="grid grid-cols-[min-content_auto_min-content] bg-secondaryDark text-whiteLight py-4 w-full max-w-[1000px] md:mx-auto text-lg md:text-2xl my-4"
    >
      <div className={`px-5 self-center ${authUser?.id === user.userId ? "text-success" : "text-whiteLight"}`}>
        {user?.rank}.
      </div>
      <div
        className={`px-4 self-center justify-self-start ${
          authUser?.id === user.userId ? "text-success" : "text-whiteLight"
        }`}
      >
        {user?.nickname}
      </div>
      <div className="px-4 whitespace-nowrap">{user?.score?.toFixed(1)} pts</div>
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

        <div className="mb-6">{rankingUsers.map((user) => <RankingItem user={user}/>)}</div>

        {!authUser.isAdmin && authUser.rank > DEFAULT_RANKING_LENGTH && (
          <>
            <div
              className={`
            w-full max-w-[1000px] md:mx-auto my-4 text-xl md:text-2xl text-whiteLight text-left
            after:inline-block after:w-[82%] md:after:w-[86%] after:h-[2px] after:relative after:content-[''] after:bottom-1 after:left-6 after:ml-0.5 after:bg-whiteLight`}
            >
              Tu puesto
            </div>
            <RankingItem user={authUser}/>
          </>
        )}

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
