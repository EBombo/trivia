import React, { useGlobal } from "reactn";
import { useRouter } from "next/router";
import { checkIsCorrect, computePointsEarned } from "../../../../business";
import { firebase, firestore } from "../../../../firebase";
import {
  ALTERNATIVES_QUESTION_TYPE,
  OPEN_QUESTION_TYPE,
  QUESTION_TIMEOUT,
  TRUE_FALSE_QUESTION_TYPE,
  DEFAULT_POINTS,
} from "../../../../components/common/DataList";
import { AlternativeAnswerCard } from "./AlternativeAnswerCard";
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard";
import { OpenAnswerCard } from "./OpenAnswerCard";

export const AnsweringSection = (props) => {
  const { question, userHasAnswered, setUserHasAnswered } = props;

  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  // creates user answer and update user score
  const onAnswering = async (answer) => {
    if (authUser.isAdmin) return;

    const isCorrectAnswer = checkIsCorrect(question, answer);

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
        lastPointsEarned: points,
        streak: newStreak,
        isLastAnswerCorrect: isCorrectAnswer,
      });

    const updateAnswersCount = firestore.doc(`lobbies/${lobbyId}`).update({
      answersCount: firebase.firestore.FieldValue.increment(1),
    });

    setUserHasAnswered(true);

    await Promise.all([addAnswerPromise, updateScorePromise, updateAnswersCount]);
  };

  return (
    <>
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
      ) : (
        <div />
      )}
    </>
  );
};
