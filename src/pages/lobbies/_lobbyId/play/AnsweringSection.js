import React, { useGlobal } from "reactn";
import { useRouter } from "next/router";
import { checkIsCorrect, computePointsEarned } from "../../../../business";
import { firebase, firestore } from "../../../../firebase";
import {
  COMPUTING_RANKING,
  DEFAULT_POINTS,
  QUESTION_TIMEOUT,
  TRUE_FALSE_QUESTION_TYPE,
} from "../../../../components/common/DataList";
import { AlternativeAnswerCard } from "./AlternativeAnswerCard";
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard";
import { OpenAnswerCard } from "./OpenAnswerCard";
import { triviaQuestionsTypes } from "./DataList";

export const AnsweringSection = (props) => {
  const { question, userHasAnswered, setUserHasAnswered } = props;

  const router = useRouter();
  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  // Creates user answer and update user score.
  const onAnswering = async (answer) => {
    if (authUser?.isAdmin) return;

    const isCorrectAnswer = checkIsCorrect(question, answer);

    const points = computePointsEarned(
      props.lobby.game.secondsLeft,
      question.time,
      isCorrectAnswer ? DEFAULT_POINTS : 0
    );

    const addAnswerPromise = firestore.collection(`lobbies/${lobbyId}/answers`).add({
      userId: authUser.id,
      user: {
        id: authUser.id,
        nickname: authUser.nickname,
      },
      answer,
      secondsLeft: props.lobby.game.secondsLeft,
      questionTime: question.time,
      questionId: question.id,
      questionNumber: question.questionNumber,
      points: points,
      createAt: new Date(),
      updateAt: new Date(),
    });

    const updateScorePromise = firestore
      .collection(`lobbies/${lobbyId}/users`)
      .doc(authUser.id)
      .update({
        lastPointsEarned: points,
        lastPointsEarnedFromQuestionNumber: question.questionNumber,
        streak: isCorrectAnswer ? firebase.firestore.FieldValue.increment(1) : 0,
        isLastAnswerCorrect: isCorrectAnswer,
      });

    const updateQuestionsPromise = firestore
      .collection(`lobbies/${lobbyId}/gameQuestions`)
      .doc(question.id)
      .update({ [`totalAnswerSelected${answer}`]: firebase.firestore.FieldValue.increment(1) });

    const updateAnswersCount = firestore.doc(`lobbies/${lobbyId}`).update({
      answersCount: firebase.firestore.FieldValue.increment(1),
    });

    setUserHasAnswered(true);

    await Promise.all([addAnswerPromise, updateScorePromise, updateAnswersCount, updateQuestionsPromise]);
  };

  const shouldBeDisabled = () => userHasAnswered || props.lobby?.game?.state === COMPUTING_RANKING;

  return (
    <>
      {[triviaQuestionsTypes.quiz.key, triviaQuestionsTypes.survey.key].includes(question?.type) ? (
        <>
          {question?.options.map((option, optionIndex) => (
            <AlternativeAnswerCard
              key={`answer-option-${optionIndex}`}
              index={optionIndex + 1}
              label={option}
              onClick={() => onAnswering(optionIndex)}
              color={
                optionIndex === 0
                  ? "red"
                  : optionIndex === 1
                  ? "green"
                  : optionIndex === 2
                  ? "yellow"
                  : optionIndex === 3
                  ? "blue"
                  : "primary"
              }
              disabled={shouldBeDisabled()}
              enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && !question.answer?.includes(optionIndex)}
            />
          ))}
        </>
      ) : question?.type === TRUE_FALSE_QUESTION_TYPE ? (
        <>
          <TrueFalseAnswerCard
            color="red"
            value={true}
            index={1}
            disabled={shouldBeDisabled()}
            enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && !question.answer}
            onClick={() => onAnswering(true)}
          />
          <TrueFalseAnswerCard
            color="green"
            value={false}
            index={2}
            disabled={shouldBeDisabled()}
            enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && question.answer}
            onClick={() => onAnswering(false)}
          />
        </>
      ) : [triviaQuestionsTypes.shortAnswer.key, triviaQuestionsTypes.brainstorm.key].includes(question?.type) &&
        !authUser.isAdmin ? (
        <div className="col-start-1 col-end-3">
          <OpenAnswerCard index={1} disabled={shouldBeDisabled()} onSubmit={(data) => onAnswering(data)} />
        </div>
      ) : (
        <div />
      )}
    </>
  );
};
