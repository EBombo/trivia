import React, { useGlobal, useMemo, useEffect, useState } from "reactn";
import { auth, config, firebase, firestore, hostName } from "../../../../firebase";
import { ButtonAnt } from "../../../../components/form/Button";
import { snapshotToArray } from "../../../../utils";
import { useRouter } from "next/router";

const DEFAULT_RANKING_LENGTH = 5;

export const Scoreboard = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser, setAuthUser] = useGlobal("user");

  const isLastQuestion = useMemo(() => props.currentQuestionNumber >= props.questions.length, [props.lobby.game]);

  const [rankingUsers, setRankingUsers] = useState([]);

  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    const fetchRanking = () => 
      firestore.collection(`lobbies/${lobbyId}/users`)
        .orderBy("score", "desc")
        .limit(DEFAULT_RANKING_LENGTH)
        .onSnapshot((rankingUsersSnapshot) => {
          const rankingUsers_ =  snapshotToArray(rankingUsersSnapshot);

          setRankingUsers(rankingUsers_);
      });

    const fetchUserRank = async () => {
      const totalRankingSnapshot = await firestore.collection(`lobbies/${lobbyId}/users`)
        .orderBy("score", "desc").get();

      let index = 0;

      totalRankingSnapshot.forEach((docSnapshot) => {
        const user = docSnapshot.data();

        if (user.id === authUser.id) {
          setAuthUser({ ...authUser, score: user.score });
          setUserRank(index + 1);

          return;
        }

        index++;
      });
    };

    fetchUserRank();

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
      <div className="px-4 whitespace-nowrap">{ user.score } pts</div>
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

        <div className="mb-6">{rankingUsers.map((user, i) => RankingItem(user, i))}</div>

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

