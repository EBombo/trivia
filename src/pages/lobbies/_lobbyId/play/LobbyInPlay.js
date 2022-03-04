import React, { useEffect, useGlobal, useState, useMemo } from "reactn";
import { UserLayout } from "../userLayout";
import { ButtonAnt } from "../../../../components/form";
import dynamic from "next/dynamic";
import find from "lodash/find";
import { useRouter } from "next/router";
import { config, firestore, hostName } from "../../../../firebase";
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
import { BarResult } from "./BarResult";
import { TrueFalseBarResult } from "./TrueFalseBarResult";
import { OpenAnswerCellResult } from "./OpenAnswerCellResult";
import { ResultCard } from "./ResultCard";
import { Scoreboard } from "./Scoreboard";
import { LobbyQuestionIntroduction } from "./LobbyQuestionIntroduction";
import { getCurrentQuestion } from "../../../../business";
import { ALTERNATIVES_QUESTION_TYPE, ANSWERING_QUESTION,
  INTRODUCING_QUESTION, OPEN_QUESTION_TYPE, QUESTION_RESULTS,
  QUESTION_TIMEOUT, RANKING,
  TRUE_FALSE_QUESTION_TYPE } from "../../../../components/common/DataList";

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [questions, setQuestions] = useState(props.lobby.questions ?? []);

  const [question, setQuestion] = useState(null);

  const [showImage, setShowImage] = useState(props.lobby.game.state === QUESTION_TIMEOUT ? false : true);

  const currentQuestionNumber = useMemo(
    () => props.lobby.game.currentQuestionNumber ?? 1,
    [props.lobby.game]
  );

  useEffect(() => {
    const question_ = getCurrentQuestion(questions, currentQuestionNumber);
    if (question_) setQuestion(question_);

    if (authUser.isAdmin) {
    }

  }, []);

  useEffect(() => {
    if (!isEmpty(questions)) return;

    const fetchQuestions = async () => {
      const gameQuestionsSnapshot = await firestore.collection(`lobbies/${props.lobby.id}/gameQuestions`).get();
      const gameQuestions = snapshotToArray(gameQuestionsSnapshot);

      setQuestions(gameQuestions);
      setQuestion(gameQuestions.find(question => question.questionNumber === currentQuestionNumber));
    };

    fetchQuestions();
  }, [questions]);

  useEffect(() => {
    if (props.lobby.game.state === QUESTION_TIMEOUT)
      setShowImage(false);

  }, [props.lobby.game.state]);

  // creates user answer and update user score
  const onAnswering = async (answer) => {
    const data = {
      userId: authUser.id,
      answer,
      questionId: question.id,
      createAt: new Date(),
      updateAt: new Date(),
    };

    const addAnswerPromise = firestore.collection(`lobbies/${lobbyId}/answers`).add(data);

    const updateScorePromise = firestore.collection(`lobbies/${lobbyId}/users`).doc(authUser.id).update({
      score: authfirebase.firestore.FieldValue.increment(20),
    });

    await Promise.all([addAnswerPromise, updateScorePromise]);
  };

  const goToNextQuestion = async () => {
    const newCurrentQuestionNumber = currentQuestionNumber + 1;
    const nextQuestion = getCurrentQuestion(questions, newCurrentQuestionNumber);

    await firestore.doc(`lobbies/${lobbyId}`).update({
      game: {
        ...props.lobby.game,
        currentQuestionNumber: newCurrentQuestionNumber,
        state: ANSWERING_QUESTION,
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

  if (props.lobby.game?.state === INTRODUCING_QUESTION) return (
    <LobbyQuestionIntroduction question={question} {...props}/>);

  // if user has already answered
  // TODO  check variable if user has answered
  if (!authUser.isAdmin && props.lobby.game?.state === ANSWERING_QUESTION && false)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <UserLayout {...props} />
        <div className="my-4">
          <NextRoundLoader />
        </div>
        <div className="font-bold text-whiteLight text-xl">¿Te sientes confiado?</div>
      </div>
    );

  if (props.lobby.game?.state === RANKING) return (<>
    <UserLayout {...props} />
    <Scoreboard
      onGoToNextQuestion={goToNextQuestion}
      questions={questions}
      currentQuestionNumber={currentQuestionNumber}
      onCloseLobby={closeLobby}
      {...props} />
    </>);

  if (props.lobby.game?.state === QUESTION_TIMEOUT && !authUser.isAdmin)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen overflow-auto text-center">
        <UserLayout {...props} />
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <ResultCard />
        </div>
      </div>
    );

  // ANSWERING_QUESTION state
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <UserLayout {...props} />

      <InPlayHeader time={question?.time} {...props} question={question}>
        {showImage ? (
          <div className="aspect-[4/1] w-full bg-secondaryDark"></div>
        ) : (
          <div className="aspect-[4/1] w-full">
            {question?.type === ALTERNATIVES_QUESTION_TYPE ? (
              <div>
                <BarResult color="red" value={20} count={8} />
                <BarResult color="green" value={50} count={12} />
                <BarResult color="yellow" value={91} count={2} />
                <BarResult color="blue" value={20} count={4} />
              </div>
            ) : question?.type === TRUE_FALSE_QUESTION_TYPE ? (
              <div>
                <TrueFalseBarResult option={true} value={91} count={2} />
                <TrueFalseBarResult option={false} value={20} count={4} />
              </div>
            ) : question?.type === OPEN_QUESTION_TYPE ? (
              <div className="grid grid-cols-4 gap-2">
                {[{}].map((_, i) => (
                  <OpenAnswerCellResult key={`open-answer-${i}`} count={0} isCorrect={false} answer={"A"} />
                ))}
              </div>
            ) : null}
          </div>
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
          <span className="text-whiteLight text-lg cursor-pointer" onClick={() => closeLobby()}>Finalizar</span>
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {question?.type === ALTERNATIVES_QUESTION_TYPE
            ? question?.options.map((option, i) => (
                <AnswerCard
                  key={`answer-option-${i}`}
                  label={option}
                  onClick={() => onAnswering(option)}
                  color={i === 0
                    ? "red"
                    : i === 1
                    ? "green"
                    : i === 2
                    ? "yellow"
                    : i === 3
                    ? "blue"
                    : "primary"} />
              ))
            : question?.type === TRUE_FALSE_QUESTION_TYPE ? (
            <>
              <TrueFalseAnswerCard
                color="red"
                value={true}
                onClick={() => onAnswering(true)} />
              <TrueFalseAnswerCard
                color="green"
                value={false}
                onClick={() => onAnswering(false)} />
            </>
          ) : question?.type === OPEN_QUESTION_TYPE ? (
            <div className="col-start-1 col-end-3">
              <OpenAnswerCard color="red" onSubmit={(data) => onAnswering(data)}/>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};
