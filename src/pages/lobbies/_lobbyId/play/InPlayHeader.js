import React, { useGlobal, useEffect, useMemo } from "reactn";
import { useRouter } from "next/router";
import { Timer } from "./Timer";
import { QuestionStep } from "./QuestionStep";
import { ButtonAnt } from "../../../../components/form";
import { firestore, config } from "../../../../firebase";
import { ANSWERING_QUESTION, QUESTION_TIMEOUT, RANKING } from "../../../../components/common/DataList";
import { useFetch } from "../../../../hooks/useFetch";
import { useSendError } from "../../../../hooks";

const putRankingUsers = async (lobbyId) => {
  const { Fetch } = useFetch();

  const fetchProps = {
    url: `${config.serverUrl}/lobbies/${lobbyId}/ranking`,
    method: "PUT",
  };

  const { error } = await Fetch(fetchProps.url, fetchProps.method);

  if (error) throw new Error(error);
};

export const InPlayHeader = (props) => {
  const router = useRouter();

  const { sendError } = useSendError();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const answersCount = useMemo(() => props.lobby.answersCount ?? 0, [props.lobby.answersCount]);

  useEffect(() => {
    if (!authUser.isAdmin) return;

    const finishAnswerTime = async () => {
      if (props.lobby.answersCount >= props.lobby.playersCount &&
        props.lobby.game.state === ANSWERING_QUESTION) {

        await updateGameState({ state: QUESTION_TIMEOUT });
      }
    };

    finishAnswerTime();
  }, [props.lobby.answersCount, props.lobby.playersCount]);

  const updateGameState = async (newGame) => {

    if (newGame.state === QUESTION_TIMEOUT) {
      props.setIsGameLoading(true);
      try {
        await putRankingUsers(lobbyId);
      } catch (e) {
        sendError(e, "updateGameState");
      }
    }

    const updateGame = Object.entries(newGame).reduce((acc, entryGameMap) => {
      acc[`game.${entryGameMap[0]}`] = entryGameMap[1];

      return acc;
    }, {});

    await firestore.doc(`lobbies/${lobbyId}`).update(updateGame);

    props.setIsGameLoading(false);
  };

  const goToRanking = async () => {
    props.setIsGameLoading(true);

    try {
      await putRankingUsers(lobbyId);
    } catch (e) {
      sendError(e, "goToRanking");
    }

    await firestore.doc(`lobbies/${lobbyId}`).update({
      "game.state": RANKING,
    });

    props.setIsGameLoading(false);
  };

  return (
    <div className="grid grid-rows-[minmax(160px,min-content)_auto]">
      <div className="relative bg-whiteLight py-4 text-center text-2xl md:text-3xl font-bold flex">
        <QuestionStep {...props} />

        <div className="relative self-center w-full text-secondaryDarken">{props.question?.question}</div>
      </div>
      <div className="grid grid-cols-[min-content_1fr] grid-rows-[auto auto] md:grid md:grid-cols-[1fr_3fr_1fr] md:grid-rows-1 text-whiteLight bg-secondaryDark bg-opacity-50 pt-4">
        <div className={`text-center ${!props.lobby?.isAdmin && "self-center"}`}>
          {authUser?.isAdmin && (
            <div className="mb-8 hidden md:inline-block">
              <ButtonAnt
                color="default"
                size="big"
                className="font-bold text-base"
                onClick={() => props.onInvalidateQuestion?.()}
                loading={props.isGameLoading}
                disabled={props.lobby.game.state === QUESTION_TIMEOUT}
              >
                Invalidar pregunta
              </ButtonAnt>
            </div>
          )}
          <Timer onUpdateGame={updateGameState} {...props} />
        </div>
        <div className="col-start-1 col-end-3 row-start-2 row-end-3 md:row-start-1 md:row-end-2 md:col-start-2 md:col-end-3 mx-4 text-center">
          {props.children}
        </div>
        <div className={`text-center flex flex-row-reverse md:flex-col justify-around items-center`}>
          {authUser.isAdmin && (
            <div className="inline-block md:mb-8">
              <ButtonAnt
                size="big"
                color="success"
                className="font-bold text-base"
                loading={props.isGameLoading}
                onClick={() => goToRanking()}
              >
                Siguiente
              </ButtonAnt>
            </div>
          )}
          <div className="min-h-[120px] flex flex-col justify-center md:justify-start">
            <div className="text-3xl md:text-5xl">{answersCount}</div>
            <div className="text-base">respuestas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
