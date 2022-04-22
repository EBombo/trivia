import React, { useEffect, useGlobal, useMemo } from "reactn";
import { useRouter } from "next/router";
import { Timer } from "./Timer";
import { QuestionStep } from "./QuestionStep";
import { ButtonAnt } from "../../../../components/form";
import { config, firestore } from "../../../../firebase";
import { ANSWERING_QUESTION, QUESTION_TIMEOUT, RANKING } from "../../../../components/common/DataList";
import { useFetch } from "../../../../hooks/useFetch";
import { useSendError, useTranslation } from "../../../../hooks";

export const InPlayHeader = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  const { Fetch } = useFetch();
  const { sendError } = useSendError();

  const [authUser] = useGlobal("user");

  const answersCount = useMemo(() => {
    return props.lobby.answersCount ?? 0;
  }, [props.lobby.answersCount]);

  const putRankingUsers = async (lobbyId) => {
    try {
      const fetchProps = {
        url: `${config.serverUrl}/lobbies/${lobbyId}/ranking`,
        method: "PUT",
      };

      const { error } = await Fetch(fetchProps.url, fetchProps.method);

      if (error) throw new Error(error);
    } catch (error) {
      sendError(error, "putRankingUsers");
    }
  };

  useEffect(() => {
    if (!authUser?.isAdmin) return;
    if (props.lobby.game.state === QUESTION_TIMEOUT) return;
    if (props.lobby.game.state !== ANSWERING_QUESTION) return;
    if ((props.lobby.answersCount ?? 0) < props.lobby.playersCount) return;

    const finishAnswerTime = async () => {
      props.setIsGameLoading(true);

      await putRankingUsers(lobbyId);

      await firestore.doc(`lobbies/${lobbyId}`).update({
        "game.state": QUESTION_TIMEOUT,
      });

      props.setIsGameLoading(false);
    };

    finishAnswerTime();
  }, [props.lobby.answersCount, props.lobby.playersCount, props.lobby.game.state]);

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
                disabled={
                  props.lobby.game.state === QUESTION_TIMEOUT ||
                  props.lobby.game.invalidQuestions?.includes(props.question.id)
                }
              >
                {t("pages.lobby.in-play.header-invalidate-question-button-label")}
              </ButtonAnt>
            </div>
          )}

          <Timer {...props} lobbyId={lobbyId} putRankingUsers={putRankingUsers} />
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
                {t("next-button-label")}
              </ButtonAnt>
            </div>
          )}

          <div className="min-h-[120px] flex flex-col justify-center md:justify-start">
            <div className="text-3xl md:text-5xl">{answersCount}</div>
            <div className="text-base">{t("pages.lobby.in-play.header-answers")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
