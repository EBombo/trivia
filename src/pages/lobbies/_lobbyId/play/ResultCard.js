import React, { useGlobal, useEffect, useState } from "reactn";
import { auth, config, firebase, firestore, hostName } from "../../../../firebase";
import { useRouter } from "next/router";
import { Image } from "../../../../components/common/Image";
import { snapshotToArray } from "../../../../utils";
import { checkIsCorrect } from "../../../../business";
import sortBy from "lodash/sortBy";

export const ResultCard = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [userRank, setUserRank] = useState(0);

  const [usersSize, setUsersSize] = useState(0);

  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const fetchUsersSize = async () => {
      const usersSnapshot = await firestore.collection(`lobbies/${lobbyId}/users`).get();

      setUsersSize(usersSnapshot.size);
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
              setAuthUser({ ...authUser, score: rankingUser.score ?? 0 });
              setUserRank(i + 1);

              break;
            }
          }

          const currentAnswer = answers.find(answer => answer.questionId === question.id && answer.userId === authUser.id);
          if (currentAnswer) {
            const isCorrect_ = checkIsCorrect(question, currentAnswer);

            setIsCorrect(isCorrect_);
          }

        });
    };

    fetchUsersSize();

    const unSubRanking = fetchRanking();
    return () => unSubRanking && unSubRanking();
  }, []);

  return (<div className="relative my-4 mx-4 pt-8 pb-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
      <div
        className={`absolute top-[-20px] left-1/2 translate-x-[-50%]
          ${isCorrect ? "bg-success" : isCorrect === false ? "bg-danger" : "bg-grayDarken" } 
          ${isCorrect ? "text-secondaryDarken" : "text-whiteLight"}
          rounded max-w-[280px] whitespace-nowrap px-8`}
      >
        <span className="inline-block py-4 pr-4 align-middle">
          {isCorrect ? (
            <Image src={`${config.storageUrl}/resources/check-with-depth.svg`} width="16px" />
          ) : isCorrect === false ? (
            <Image src={`${config.storageUrl}/resources/cross-with-depth.svg`} width="16px" />
          ) : null}
        </span>
        {isCorrect ? "Respuesta correcta" : isCorrect === false ? "Respuesta incorrecta" : "Respuesta sin responder"}
      </div>

      {isCorrect ? (
        <>
          <div className="text-secondaryDarken">
            <span className="inline-block py-4 align-middle">
              <Image src={`${config.storageUrl}/resources/red-fire-streak.svg`} width="12px" />
            </span>
            Racha de respuestas: 1
          </div>
          <div className="text-black text-3xl py-8">+600 puntos</div>
        </>
      ) : (
        <div className="text-secondaryDarken">¡Hay que mantener la cabeza en el juego!</div>
      )}

      <div className="text-black">Puntaje actual: { authUser.score } pts</div>
      <div className="text-black">Puesto: { userRank }/{ usersSize }</div>
    </div>);
};

