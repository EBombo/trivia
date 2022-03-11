import React, { useGlobal, useEffect, useState, useMemo } from "reactn";
import { useRouter } from "next/router";
import { Timer } from "./Timer";
import { QuestionStep } from "./QuestionStep";
import { ButtonAnt } from "../../../../components/form";
import { firestore } from "../../../../firebase";
import { RANKING } from "../../../../components/common/DataList";

export const InPlayHeader = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [answersCount, setAnswersCount] = useState(0);

  const updateGameState = async (newGame) => {
    const updateGame = Object.entries(newGame).reduce((acc, entryGameMap) => {
      acc[`game.${entryGameMap[0]}`] = entryGameMap[1];

      return acc;
    }, {});

    await firestore.doc(`lobbies/${lobbyId}`).update(updateGame);
  };

  const goToRanking = async () => {
    await firestore.doc(`lobbies/${lobbyId}`).update({
      "game.state": RANKING,
    });
  };

  useEffect(() => {
    const fetchAnswers = () => {
      return firestore.collection(`lobbies/${lobbyId}/answers`)
        .where("questionId", "==", props.question.id)
        .onSnapshot((answersSnapshot) => {
          setAnswersCount(answersSnapshot.size);
        });
    };

    const unSubAnswersCount = fetchAnswers();
    return () => unSubAnswersCount && unSubAnswersCount();
  }, [props.question]);


  return (
    <div className="grid grid-rows-[minmax(160px,min-content)_auto]">
      <div className="relative bg-whiteLight py-4 text-center text-2xl md:text-3xl font-bold flex">
        <QuestionStep {...props}/>

        <div className="relative self-center w-full text-secondaryDarken">{props.question?.question}</div>
      </div>
      <div className="grid grid-cols-[min-content_1fr] grid-rows-[auto auto] md:grid md:grid-cols-[1fr_3fr_1fr] md:grid-rows-1 text-whiteLight bg-secondaryDark bg-opacity-50 py-8">
        <div className={`text-center ${!props.lobby?.isAdmin && "self-center"}`}>
          {authUser?.isAdmin && (
            <div className="mb-8 hidden md:inline-block">
              <ButtonAnt color="default" size="big" className="font-bold" onClick={() => props.onInvalidateQuestion?.()}>
                Invalidar pregunta
              </ButtonAnt>
            </div>
          )}
          <Timer label="Espera que acabe el tiempo..." onUpdateGame={updateGameState} {...props} />
        </div>
        <div className="col-start-1 col-end-3 row-start-2 row-end-3 md:row-start-1 md:row-end-2 md:col-start-2 md:col-end-3 mx-4 text-center">
          {props.children}
        </div>
        <div
          className={`text-center ${
            !props.lobby?.isAdmin && "self-center"
          } flex flex-row-reverse md:flex-col justify-around items-center`}
        >
          {authUser.isAdmin && (
            <div className="inline-block md:mb-8">
              <ButtonAnt size="big" color="success" className="font-bold text-lg" onClick={() => goToRanking()}>
                Siguiente
              </ButtonAnt>
            </div>
          )}
          <div>
            <div className="text-3xl md:text-5xl">{ answersCount }</div>
            <div className="text-base">respuestas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
