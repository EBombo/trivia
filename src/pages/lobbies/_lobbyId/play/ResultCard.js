import React, { useGlobal, useEffect, useState, useMemo } from "reactn";
import { useRouter } from "next/router";
import { config, firestore } from "../../../../firebase";
import { InPlaySpinLoader } from "./InPlaySpinLoader";
import { Image } from "../../../../components/common/Image";

export const ResultCard = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [userRank, setUserRank] = useState(0);

  const [userScore, setUserScore] = useState(0);

  const [streakCount, setStreakCount] = useState(0);

  const [pointsEarned, setPointsEarned] = useState(0);

  const [isCorrect, setIsCorrect] = useState(null);

  const usersSize = useMemo(() => props.lobby?.playersCount ?? 0, [props.lobby]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userSnapshot = await firestore.doc(`lobbies/${lobbyId}/users/${authUser.id}`).get();
      const user = userSnapshot.data();

      setPointsEarned(user.lastPointsEarned ?? 0);
      setStreakCount(user.streak ?? 0);
      setUserScore(user.score ?? 0);
      setUserRank(user.rank ?? 0);

      setIsCorrect(user.isLastAnswerCorrect);
    };

    fetchUsers();
  }, []);

  if (isCorrect === null) return (
    <div className="relative my-4 mx-4 pt-8 pb-4 px-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
      <InPlaySpinLoader/>
    </div>
  );

  return (
    <div className="relative my-4 mx-4 pt-8 pb-4 px-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
      <div
        className={`absolute top-[-20px] left-1/2 translate-x-[-50%]
          ${isCorrect ? "bg-success" : "bg-danger"} 
          ${isCorrect ? "text-secondaryDarken" : "text-whiteLight"}
          rounded max-w-[280px] whitespace-nowrap px-8`}
      >
        <span className="inline-block py-4 pr-4 align-middle">
          {isCorrect ? (
            <Image src={`${config.storageUrl}/resources/check-with-depth.svg`} width="16px" />
          ) : (
            <Image src={`${config.storageUrl}/resources/cross-with-depth.svg`} width="16px" />
          )}
        </span>
        {isCorrect ? "Respuesta correcta" : "Respuesta incorrecta"}
      </div>

      {isCorrect ? (
        <>
          <div className="text-secondaryDarken">
            <span className="inline-block py-4 align-middle">
              <Image src={`${config.storageUrl}/resources/red-fire-streak.svg`} size="contain" width="12px" />
            </span>
            Racha de respuestas: {streakCount}
          </div>
          <div className="text-black text-3xl py-8">+{pointsEarned?.toFixed(1)} puntos</div>
        </>
      ) : (
        <div className="text-secondaryDarken">¡Hay que mantener la cabeza en el juego!</div>
      )}

      <div className="text-black">Puntaje actual: {userScore?.toFixed(1)} pts</div>
      <div className="text-black">
        Puesto: {userRank}/{usersSize !== 0 ? usersSize : "--"}
      </div>
    </div>
  );
};
