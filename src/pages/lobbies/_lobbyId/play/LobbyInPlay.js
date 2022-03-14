import React, { useEffect, useGlobal, useState, useMemo } from "reactn";
import { UserLayout } from "../userLayout";
import { ButtonAnt } from "../../../../components/form";
import dynamic from "next/dynamic";
import find from "lodash/find";
import { useRouter } from "next/router";
import { config, firebase, firestore, hostName } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
import { darkTheme } from "../../../../theme";
import defaultTo from "lodash/defaultTo";
import isEmpty from "lodash/isEmpty";
import { Image } from "../../../../components/common/Image";
import { InPlayHeader } from "./InPlayHeader";
import { AnswerCard } from "./AnswerCard";
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard";
import { OpenAnswerCard } from "./OpenAnswerCard";
import { NextRoundLoader } from "./NextRoundLoader";
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
  QUESTION_RESULTS,
  QUESTION_TIMEOUT,
  RANKING,
  TRUE_FALSE_QUESTION_TYPE,
  DEFAULT_POINTS,
} from "../../../../components/common/DataList";
import { useUser } from "../../../../hooks";

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [authUserLS, setAuthUserLS] = useUser();

  const [questions] = useState(props.lobby.gameQuestions ?? []);

  const [showImage, setShowImage] = useState(props.lobby.game.state === QUESTION_TIMEOUT ? false : true);

  const [userHasAnswered, setUserHasAnswered] = useState(null);

  const currentQuestionNumber = useMemo(() => props.lobby.game.currentQuestionNumber ?? 1, [props.lobby.game]);

  const question = useMemo(() => {
    if (isEmpty(questions)) return;

    return getCurrentQuestion(questions, currentQuestionNumber);
  }, [props.lobby.game, questions]);

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

  useEffect(() => {
    if (props.lobby.game.state === QUESTION_TIMEOUT) setShowImage(false);
  }, [props.lobby.game.state]);

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

    setAuthUserLS({ ...authUserLS });

    setUserHasAnswered(true);

    await Promise.all([addAnswerPromise, updateScorePromise]);
  };

  const invalidateQuestion = async () => {
    await firestore.doc(`lobbies/${lobbyId}`).update({
      "game.invalidQuestions": (props.lobby.game.invalidQuestions ?? []).concat([question.id]),
    });
  };

  // only admin calls this function
  const goToNextQuestion = async () => {
    const newCurrentQuestionNumber = currentQuestionNumber + 1;
    const nextQuestion = getCurrentQuestion(questions, newCurrentQuestionNumber);

    await firestore.doc(`lobbies/${lobbyId}`).update({
      game: {
        ...props.lobby.game,
        currentQuestionNumber: newCurrentQuestionNumber,
        state: INTRODUCING_QUESTION,
        secondsLeft: parseInt(nextQuestion.time),
      },
    });

    setShowImage(true);
  };

  const closeLobby = async () => {
    await firestore.doc(`lobbies/${lobbyId}`).update({
      isClosed: true,
    });
  };

  if (!question)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <UserLayout {...props} />
        <div className="my-4">
          <NextRoundLoader />
        </div>
      </div>
    );

  if (props.lobby.game?.state === INTRODUCING_QUESTION)
    return <LobbyQuestionIntroduction question={question} {...props} />;

  // if user has already answered
  if (!authUser.isAdmin && props.lobby.game?.state === ANSWERING_QUESTION && userHasAnswered)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <UserLayout {...props} />
        <div className="my-4">
          <NextRoundLoader />
        </div>
        <div className="font-bold text-whiteLight text-xl">¿Te sientes confiado?</div>
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
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <UserLayout {...props} />

      <InPlayHeader
        key={question}
        time={question?.time}
        question={question}
        onInvalidateQuestion={invalidateQuestion}
        {...props}
      >
        {showImage ? (
          <div className="aspect-[4/1] w-full bg-secondaryDark">
            {question.fileUrl
              ? (<Image src={question.fileUrl} width="100%" height="100%" />)
              : (<Image src={`${config.storageUrl}/resources/trivia-brand-logo.svg`} width="100%" height="100%" />)
            }
          </div>
        ) : (
          <div className="aspect-[4/1] w-full">{question && <AlternativeResults question={question} />}</div>
        )}

        {props.lobby.game.state === QUESTION_TIMEOUT && (
          <div>
            <span className="cursor-pointer underline" onClick={() => setShowImage((oldValue) => !oldValue)}>
              Mostrar imagen
            </span>
          </div>
        )}
      </InPlayHeader>

      <div className="grid md:grid-cols-[1fr_3fr_1fr] mb-8 bg-secondaryDark bg-opacity-50 py-8">
        <div className="text-center self-end">
          {props.lobby.game.state === QUESTION_TIMEOUT && (
            <span className="text-whiteLight text-lg cursor-pointer" onClick={() => closeLobby()}>
              Finalizar
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {question?.type === ALTERNATIVES_QUESTION_TYPE ? (
            question?.options.map((option, i) => (
              <AnswerCard
                key={`answer-option-${i}`}
                label={option}
                onClick={() => onAnswering(option)}
                color={i === 0 ? "red" : i === 1 ? "green" : i === 2 ? "yellow" : i === 3 ? "blue" : "primary"}
                disabled={userHasAnswered}
              />
            ))
          ) : question?.type === TRUE_FALSE_QUESTION_TYPE ? (
            <>
              <TrueFalseAnswerCard
                color="red"
                value={true}
                disabled={userHasAnswered}
                onClick={() => onAnswering(true)}
              />
              <TrueFalseAnswerCard
                color="green"
                value={false}
                disabled={userHasAnswered}
                onClick={() => onAnswering(false)}
              />
            </>
          ) : question?.type === OPEN_QUESTION_TYPE && !authUser.isAdmin ? (
            <div className="col-start-1 col-end-3">
              <OpenAnswerCard color="red" disabled={userHasAnswered} onSubmit={(data) => onAnswering(data)} />
            </div>
          ) : null}
        </div>
      </div>
      <Footer {...props} />
    </div>
  );
};
