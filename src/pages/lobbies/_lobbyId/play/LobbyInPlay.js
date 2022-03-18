import React, { useEffect, useGlobal, useState, useMemo } from "reactn";
import { UserLayout } from "../userLayout";
import { useRouter } from "next/router";
import { config, firebase, firestore } from "../../../../firebase";
import isEmpty from "lodash/isEmpty";
import { Image } from "../../../../components/common/Image";
import { ButtonAnt } from "../../../../components/form/Button";
import { InPlayHeader } from "./InPlayHeader";
import { AlternativeAnswerCard } from "./AlternativeAnswerCard";
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard";
import { OpenAnswerCard } from "./OpenAnswerCard";
import { InPlaySpinLoader } from "./InPlaySpinLoader";
import { Footer } from "./Footer";
import { ResultCard } from "./ResultCard";
import { Scoreboard } from "./Scoreboard";
import { AlternativeResults } from "./AlternativeResults";
import { LobbyQuestionIntroduction } from "./LobbyQuestionIntroduction";
import { getCurrentQuestion, computePointsEarned } from "../../../../business";
import {
  ALTERNATIVES_QUESTION_TYPE,
  ANSWERING_QUESTION,
  INTRODUCING_QUESTION,
  OPEN_QUESTION_TYPE,
  QUESTION_TIMEOUT,
  RANKING,
  TRUE_FALSE_QUESTION_TYPE,
  DEFAULT_POINTS,
} from "../../../../components/common/DataList";
import { useSendError } from "../../../../hooks";

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const { sendError } = useSendError();

  const [questions] = useState(props.lobby.gameQuestions ?? []);

  const [isGameLoading, setIsGameLoading] = useState(false);

  const [showImage, setShowImage] = useState(!(props.lobby.game.state === QUESTION_TIMEOUT));

  const [userHasAnswered, setUserHasAnswered] = useState(null);

  const currentQuestionNumber = useMemo(() => props.lobby.game.currentQuestionNumber ?? 1, [props.lobby.game]);

  const question = useMemo(() => {
    if (isEmpty(questions)) return;

    return getCurrentQuestion(questions, currentQuestionNumber);
  }, [props.lobby.game, questions]);

  useEffect(() => {
    if (props.lobby.game.state === QUESTION_TIMEOUT) setShowImage(false);
  }, [props.lobby.game.state]);

  useEffect(() => {
    if (authUser.isAdmin) return;

    if (!question) return;

    const fetchUserHasAnswered = async () => {
      const answersQuerySnapshot = await firestore
        .collection(`lobbies/${lobbyId}/answers`)
        .where("userId", "==", authUser.id)
        .where("questionId", "==", question.id)
        .get();

      const hasAnswered = !answersQuerySnapshot.empty;

      setUserHasAnswered(hasAnswered);
      setShowImage(true);
    };

    fetchUserHasAnswered();
  }, [question]);

  const isCorrect = (question, answer) => {
    if (question.type === ALTERNATIVES_QUESTION_TYPE) {
      const answers = question.answer.map((answerIndex) => question.options[answerIndex]);

      return answers.includes(answer);
    }

    if (question.type === TRUE_FALSE_QUESTION_TYPE) return answer == question.answer;

    if (question.type === OPEN_QUESTION_TYPE) return question.answer.includes(answer);
  };

  // creates user answer and update user score
  const onAnswering = async (answer) => {
    if (authUser.isAdmin) return;

    const isCorrectAnswer = isCorrect(question, answer);

    const points = computePointsEarned(
      props.lobby.game.secondsLeft,
      question.time,
      isCorrectAnswer ? DEFAULT_POINTS : 0
    );

    const data = {
      userId: authUser.id,
      user: {
        id: authUser.id,
        nickname: authUser.nickname,
      },
      answer,
      secondtLeft: props.lobby.game.secondsLeft,
      questionTime: question.time,
      questionId: question.id,
      questionNumber: question.questionNumber,
      points: points,
      createAt: new Date(),
      updateAt: new Date(),
    };

    const addAnswerPromise = firestore.collection(`lobbies/${lobbyId}/answers`).add(data);

    const newStreak = isCorrectAnswer ? firebase.firestore.FieldValue.increment(1) : 0;

    const updateScorePromise = firestore
      .collection(`lobbies/${lobbyId}/users`)
      .doc(authUser.id)
      .update({
        score: firebase.firestore.FieldValue.increment(points),
        streak: newStreak,
      });

    const updateAnswersCount = firestore.doc(`lobbies/${lobbyId}`).update({
      answersCount: firebase.firestore.FieldValue.increment(1),
    });

    setUserHasAnswered(true);

    await Promise.all([addAnswerPromise, updateScorePromise, updateAnswersCount]);
  };

  const invalidateQuestion = async () => {
    setIsGameLoading(true);

    try {
      await firestore.doc(`lobbies/${lobbyId}`).update({
        "game.invalidQuestions": (props.lobby.game.invalidQuestions ?? []).concat([question.id]),
      });
    } catch (e) {
      sendError(e, "invalidateQuestion");
    }

    setIsGameLoading(false);
  };

  // only admin calls this function
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
    } catch (e) {
      sendError(e, "goToNextQuestion");
    }

    setShowImage(true);

    setIsGameLoading(false);
  };

  const closeLobby = async () => {
    setIsGameLoading(true);

    try {
      await firestore.doc(`lobbies/${lobbyId}`).update({
        isClosed: true,
      });
    } catch (e) {
      sendError(e, "closeLobby");
    }
    setIsGameLoading(false);
  };

  if (!question)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <UserLayout {...props} />
        <div className="my-4">
          <InPlaySpinLoader />
        </div>
      </div>
    );

  if (props.lobby.game?.state === INTRODUCING_QUESTION)
    return <LobbyQuestionIntroduction question={question} {...props} />;

  // if user has already answered
  if (!authUser.isAdmin && props.lobby.game?.state === ANSWERING_QUESTION && userHasAnswered)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center grid grid-rows-[50px-auto]">
        <UserLayout {...props} />
        <div className="">
          <div className="my-4">
            <InPlaySpinLoader />
          </div>
          <div className="font-bold text-whiteLight text-xl">¿Te sientes confiado?</div>
        </div>
      </div>
    );

  if (props.lobby.game?.state === RANKING)
    return (
      <>
        <UserLayout {...props} />
        <Scoreboard
          onGoToNextQuestion={goToNextQuestion}
          questions={questions}
          currentQuestionNumber={currentQuestionNumber}
          onCloseLobby={closeLobby}
          {...props}
        />
      </>
    );

  if (props.lobby.game?.state === QUESTION_TIMEOUT && !authUser.isAdmin)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen overflow-auto text-center">
        <UserLayout {...props} />
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <ResultCard question={question} invalidQuestions={props.lobby.game.invalidQuestions} {...props} />
        </div>
      </div>
    );

  // ANSWERING_QUESTION state
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto grid grid-rows-[50px_min-content_auto_60px] 2xl:grid-rows-[50px_auto_auto_75px]">
      <UserLayout {...props} />

      <InPlayHeader
        key={question}
        time={question?.time}
        question={question}
        onInvalidateQuestion={invalidateQuestion}
        isGameLoading={isGameLoading}
        setIsGameLoading={setIsGameLoading}
        {...props}
      >
        {showImage ? (
          <div className="aspect-[4/1] w-full h-full bg-secondaryDark mb-2">
            {question.fileUrl ? (
              <Image src={question.fileUrl} width="100%" size="contain" noImgTag />
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
          <div className="aspect-[4/1] w-full">{question && <AlternativeResults question={question} {...props} />}</div>
        )}

        {props.lobby.game.state === QUESTION_TIMEOUT && (
          <div>
            <span className="cursor-pointer underline" onClick={() => setShowImage((oldValue) => !oldValue)}>
              Mostrar imagen
            </span>
          </div>
        )}
      </InPlayHeader>

      <div className="grid md:grid-cols-[1fr_3fr_1fr] bg-secondaryDark bg-opacity-50 pb-2">
        <div className="text-center self-end py-4">
          {props.lobby.game.state === QUESTION_TIMEOUT && (
            <span className="text-whiteLight text-lg cursor-pointer" onClick={() => !isGameLoading && closeLobby()}>
              Finalizar
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {question?.type === ALTERNATIVES_QUESTION_TYPE ? (
            question?.options.map((option, i) => (
              <AlternativeAnswerCard
                key={`answer-option-${i}`}
                label={option}
                onClick={() => onAnswering(option)}
                color={i === 0 ? "red" : i === 1 ? "green" : i === 2 ? "yellow" : i === 3 ? "blue" : "primary"}
                disabled={userHasAnswered}
                enableOpacity={
                  props.lobby.game.state === QUESTION_TIMEOUT &&
                  !question.answer.map((answerIndex) => question?.options[answerIndex])?.includes(option)
                }
              />
            ))
          ) : question?.type === TRUE_FALSE_QUESTION_TYPE ? (
            <>
              <TrueFalseAnswerCard
                color="red"
                value={true}
                disabled={userHasAnswered}
                enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && question.answer}
                onClick={() => onAnswering(true)}
              />
              <TrueFalseAnswerCard
                color="green"
                value={false}
                disabled={userHasAnswered}
                enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && !question.answer}
                onClick={() => onAnswering(false)}
              />
            </>
          ) : question?.type === OPEN_QUESTION_TYPE && !authUser.isAdmin ? (
            <div className="col-start-1 col-end-3">
              <OpenAnswerCard color="red" disabled={userHasAnswered} onSubmit={(data) => onAnswering(data)} />
            </div>
          ) : null}

          {authUser?.isAdmin && (
            <div className="mt-4 mb-8 md:hidden md:inline-block mx-4">
              <ButtonAnt
                color="default"
                size="big"
                className="font-bold text-base"
                width="100%"
                loading={isGameLoading}
                disabled={props.lobby.game.state === QUESTION_TIMEOUT}
                onClick={() => !isGameLoading && invalidateQuestion()}
              >
                Invalidar pregunta
              </ButtonAnt>
            </div>
          )}
        </div>
      </div>
      <Footer {...props} />
    </div>
  );
};
