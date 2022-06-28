import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import { UserLayout } from "../userLayout";
import { useRouter } from "next/router";
import { config, firestore, firestoreBomboGames } from "../../../../firebase";
import isEmpty from "lodash/isEmpty";
import { Image } from "../../../../components/common/Image";
import { ButtonAnt } from "../../../../components/form";
import { InPlayHeader } from "./InPlayHeader";
import { AnsweringSection } from "./AnsweringSection";
import { InPlaySpinLoader } from "./InPlaySpinLoader";
import { Footer } from "./Footer";
import { ResultCard } from "./ResultCard";
import { Scoreboard } from "./Scoreboard";
import { QuestionResults } from "./QuestionResults";
import { LobbyQuestionIntroduction } from "./LobbyQuestionIntroduction";
import { getCurrentQuestion } from "../../../../business";
import {
  ANSWERING_QUESTION,
  COMPUTING_RANKING,
  INTRODUCING_QUESTION,
  QUESTION_TIMEOUT,
  RANKING,
} from "../../../../components/common/DataList";
import { useSendError, useTranslation } from "../../../../hooks";
import { snapshotToArrayWithId } from "../../../../utils";
import difference from "lodash/difference";

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const { t } = useTranslation();

  const [authUser] = useGlobal("user");

  const { sendError } = useSendError();

  const [isGameLoading, setIsGameLoading] = useState(false);

  const [userHasAnswered, setUserHasAnswered] = useState(null);

  const [showImage, setShowImage] = useState(!(props.lobby.game.state === QUESTION_TIMEOUT));

  const currentQuestionNumber = useMemo(() => {
    return props.lobby.game.currentQuestionNumber ?? 1;
  }, [props.lobby.game]);

  const questions = useMemo(() => {
    return props.lobby.gameQuestions ?? [];
  }, [props.lobby]);

  const currentQuestion = useMemo(() => {
    if (isEmpty(questions)) return;

    return getCurrentQuestion(questions, currentQuestionNumber);
  }, [props.lobby.game, questions]);

  useEffect(() => {
    if (!props.lobby) return;
    if (!authUser) return;

    // Avoid calling logout multiple times when the lobby is close
    if (props.lobby?.isClosed) return;

    // AuthUser is admin.
    if (props.lobby.game.usersIds.includes(authUser.id)) return;

    const verifyUserAccount = async () => {
      const lobbyUserSnapshot = await firestore.collection(`lobbies/${lobbyId}/users`).doc(authUser.id).get();

      // If user exists then do nothing.
      if (lobbyUserSnapshot.exists) return;

      return props.logout();
    };

    verifyUserAccount();
  }, [authUser?.id]);

  useEffect(() => {
    if (props.lobby.game.state === QUESTION_TIMEOUT) setShowImage(false);
  }, [props.lobby.game.state]);

  useEffect(() => {
    if (authUser?.isAdmin) return;

    if (!currentQuestion) return;

    const fetchUserHasAnswered = async () => {
      const answersQuerySnapshot = await firestore
        .collection(`lobbies/${lobbyId}/answers`)
        .where("userId", "==", authUser.id)
        .where("questionId", "==", currentQuestion.id)
        .get();

      const hasAnswered = !answersQuerySnapshot.empty;

      setUserHasAnswered(hasAnswered);
      setShowImage(true);
    };

    fetchUserHasAnswered();
  }, [currentQuestion, lobbyId, authUser]);

  const invalidateQuestion = async () => {
    setIsGameLoading(true);

    try {
      await firestore.doc(`lobbies/${lobbyId}`).update({
        "game.invalidQuestions": (props.lobby.game.invalidQuestions ?? []).concat([currentQuestion.id]),
      });
    } catch (error) {
      sendError(error, "invalidateQuestion");
    }

    setIsGameLoading(false);
  };

  // Only admin calls this function.
  const goToNextQuestion = async () => {
    setIsGameLoading(true);

    try {
      const newCurrentQuestionNumber = currentQuestionNumber + 1;
      const nextQuestion = getCurrentQuestion(questions, newCurrentQuestionNumber);

      await firestore.doc(`lobbies/${lobbyId}`).update({
        answersCount: 0,
        game: {
          ...props.lobby.game,
          currentQuestionNumber: newCurrentQuestionNumber,
          state: INTRODUCING_QUESTION,
          secondsLeft: parseInt(nextQuestion.time),
        },
      });
    } catch (error) {
      sendError(error, "goToNextQuestion");
    }

    setShowImage(true);

    setIsGameLoading(false);
  };

  const closeLobby = async () => {
    setIsGameLoading(true);

    const computePlayersStats = async () => {
      const answersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`).get();

      const answers = snapshotToArrayWithId(answersSnapshot);

      // Group correct and wrongs answers by UserId.
      const userStatsAnswersMap = answers.reduce((acc, answer) => {
        if (!acc[answer.userId]) acc[answer.userId] = { correct: [], incorrect: [], noAnswer: [] };

        if (answer.points === 0) {
          acc[answer.userId].incorrect.push(answer.questionId);
        } else {
          acc[answer.userId].correct.push(answer.questionId);
        }

        return acc;
      }, {});

      // Calculate no-answered questions for each user.
      Object.keys(userStatsAnswersMap).forEach((userId) => {
        const userStat = userStatsAnswersMap[userId];

        const questionIds = questions.map((question) => question.id);

        let leftQuestions = difference(questionIds, userStat.correct);

        leftQuestions = difference(leftQuestions, userStat.incorrect);

        userStatsAnswersMap[userId]["noAnswer"] = leftQuestions || [];
      });

      // Generate list of promises of User updates in Firestore.
      const updateUserStatsPromises = Object.keys(userStatsAnswersMap).map((userId) => {
        const userStat = userStatsAnswersMap[userId];

        return firestore.doc(`lobbies/${lobbyId}/users/${userId}`).update({
          stats: { ...userStat },
        });
      });

      await Promise.allSettled([...updateUserStatsPromises]);
    };

    try {
      const endTime = new Date();

      const triviaCloseLobbyPromise = firestore.doc(`lobbies/${lobbyId}`).update({
        isClosed: true,
        updateAt: endTime,
      });

      const bomboGamesCloseLobbyPromise = firestoreBomboGames.doc(`lobbies/${lobbyId}`).set(
        {
          ...props.lobby,
          isClosed: true,
          updateAt: endTime,
        },
        { merge: true }
      );

      await Promise.all([triviaCloseLobbyPromise, bomboGamesCloseLobbyPromise, computePlayersStats()]);
    } catch (error) {
      sendError(error, "closeLobby");
    }

    setIsGameLoading(false);
  };

  /** Loading page. **/
  if (!currentQuestion)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <UserLayout musicPickerSetting volumeSetting lockSetting {...props} />
        <div className="my-4">
          <InPlaySpinLoader />
        </div>
      </div>
    );

  /** Question logo animation. **/
  if (props.lobby.game?.state === INTRODUCING_QUESTION)
    return <LobbyQuestionIntroduction question={currentQuestion} {...props} />;

  /** If user has already answered. **/
  if (
    !authUser.isAdmin &&
    (props.lobby.game?.state === ANSWERING_QUESTION || props.lobby.game?.state === COMPUTING_RANKING) &&
    userHasAnswered
  )
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center grid grid-rows-[50px-auto]">
        <UserLayout musicPickerSetting volumeSetting lockSetting {...props} />

        <div className="">
          <div className="my-4">
            <InPlaySpinLoader />
          </div>
          <div className="font-bold text-whiteLight text-xl">{t("pages.lobby.in-play.waiting-label")}</div>
        </div>
      </div>
    );

  /** Show ranking. **/
  if (props.lobby.game?.state === RANKING)
    return (
      <>
        <UserLayout musicPickerSetting volumeSetting lockSetting {...props} />
        <Scoreboard
          onGoToNextQuestion={goToNextQuestion}
          questions={questions}
          currentQuestionNumber={currentQuestionNumber}
          onCloseLobby={closeLobby}
          {...props}
        />
      </>
    );

  /** User, show score. **/
  if (props.lobby.game?.state === QUESTION_TIMEOUT && !authUser.isAdmin)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen overflow-auto text-center">
        <UserLayout musicPickerSetting volumeSetting lockSetting {...props} />
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <ResultCard question={currentQuestion} invalidQuestions={props.lobby.game.invalidQuestions} {...props} />
        </div>
      </div>
    );

  /** User and Admin, answering question form. **/
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto grid grid-rows-[50px_min-content_auto_60px] 2xl:grid-rows-[50px_auto_auto_75px]">
      <UserLayout musicPickerSetting volumeSetting lockSetting {...props} />

      <InPlayHeader
        key={currentQuestion.id}
        time={currentQuestion?.time}
        question={currentQuestion}
        onInvalidateQuestion={invalidateQuestion}
        isGameLoading={isGameLoading}
        setIsGameLoading={setIsGameLoading}
        {...props}
      >
        {showImage ? (
          <div className="aspect-[4/1] w-full h-[calc(100%-25px)] bg-secondaryDark mb-2">
            {currentQuestion.fileUrl ? (
              <Image src={currentQuestion.fileUrl} width="100%" size="contain" noImgTag />
            ) : (
              <Image
                src={`${config.storageUrl}/resources/trivia-brand-logo.svg`}
                width="100%"
                size="contain"
                noImgTag
              />
            )}
          </div>
        ) : (
          <div className="aspect-[4/1] w-full">
            {currentQuestion && <QuestionResults question={currentQuestion} {...props} />}
          </div>
        )}

        {/** Admin, show result. **/}
        {props.lobby.game.state === QUESTION_TIMEOUT && (
          <div>
            <span className="cursor-pointer underline" onClick={() => setShowImage((oldValue) => !oldValue)}>
              {t("pages.lobby.in-play.show-image")}
            </span>
          </div>
        )}
      </InPlayHeader>

      <div className="grid md:grid-cols-[1fr_3fr_1fr] bg-secondaryDark bg-opacity-50 pb-2">
        <div className="text-center self-end py-4">
          {props.lobby.game.state === QUESTION_TIMEOUT && authUser?.isAdmin && (
            <span className="text-whiteLight text-lg cursor-pointer" onClick={() => !isGameLoading && closeLobby()}>
              {t("pages.lobby.in-play.finish")}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3 test-question-for-trivia">
          <AnsweringSection
            setUserHasAnswered={setUserHasAnswered}
            userHasAnswered={userHasAnswered}
            question={currentQuestion}
            {...props}
          />

          {authUser?.isAdmin && (
            <div className="mt-4 mb-8 md:hidden md:inline-block mx-4">
              <ButtonAnt
                color="default"
                size="big"
                className="font-bold text-base"
                width="100%"
                loading={isGameLoading}
                disabled={
                  props.lobby.game.state === QUESTION_TIMEOUT ||
                  props.lobby.game.invalidQuestions?.includes(currentQuestion.id)
                }
                onClick={() => !isGameLoading && invalidateQuestion()}
              >
                {t("pages.lobby.in-play.header-invalidate-question-button-label")}
              </ButtonAnt>
            </div>
          )}
        </div>
      </div>

      <Footer {...props} />
    </div>
  );
};
