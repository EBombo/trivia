import React, { useEffect, useMemo, useState } from "reactn";
import { useRouter } from "next/router";
import { firestore } from "../../../../firebase";
import { spinLoaderMin } from "../../../../components/common/loader";
import { checkIsCorrect } from "../../../../business";
import { AlternativeBarResult } from "./AlternativeBarResult";
import { TrueFalseBarResult } from "./TrueFalseBarResult";
import { OpenAnswerCellResult } from "./OpenAnswerCellResult";
import { QUESTION_TIMEOUT, TRUE_FALSE_QUESTION_TYPE } from "../../../../components/common/DataList";
import { triviaQuestionsTypes } from "./DataList";

export const QuestionResults = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [isBrainStorm] = useState(props.question.type === triviaQuestionsTypes.brainstorm.key);
  const [answerCountMap, setAnswerCountMap] = useState({});

  const totalCount = useMemo(
    () => Object.values(answerCountMap).reduce((acc, answer) => acc + answer.count, 0),
    [answerCountMap]
  );

  useEffect(() => {
    if (!props.question) return;

    const listenAnswersSnapshot = () =>
      firestore
        .collection(`lobbies/${lobbyId}/answers`)
        .where("questionId", "==", props.question?.id)
        .onSnapshot((answersSnapshot) => {
          const answerCountMap_ = answersSnapshot.docs.reduce((acc, answerSnapshot) => {
            const answer = answerSnapshot.data();

            // Guardar la respuesta que se guarde con el indice y no con el valor.
            if (!(answer.answer in acc)) acc[answer.answer] = { count: 0 };

            acc[answer.answer].count += 1;

            return acc;
          }, {});

          setAnswerCountMap({ ...answerCountMap_ });
        });

    const listenAnswersUnsub = listenAnswersSnapshot();
    return () => listenAnswersUnsub && listenAnswersUnsub();
  }, [props.question]);

  if (!props.question) return spinLoaderMin();

  if ([triviaQuestionsTypes.quiz.key, triviaQuestionsTypes.survey.key].includes(props.question?.type))
    return (
      <div>
        {props.question.options.map((_, optionIndex) => (
          <AlternativeBarResult
            key={`result-option-${optionIndex}`}
            isCorrect={props.question?.answer.includes(optionIndex)}
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
            value={Math.ceil(((answerCountMap[optionIndex]?.count ?? 0) / totalCount) * 100)}
            count={answerCountMap[optionIndex]?.count ?? 0}
            enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && !props.question.answer?.includes(optionIndex)}
          />
        ))}
      </div>
    );

  if (props.question?.type === TRUE_FALSE_QUESTION_TYPE)
    return (
      <div>
        <TrueFalseBarResult
          isCorrect={props.question?.answer}
          option={true}
          value={Math.ceil(((answerCountMap?.[true]?.count ?? 0) / totalCount) * 100)}
          count={answerCountMap?.[true]?.count ?? 0}
          enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && !props.question.answer}
        />
        <TrueFalseBarResult
          isCorrect={!props.question?.answer}
          option={false}
          value={Math.ceil(((answerCountMap?.[false]?.count ?? 0) / totalCount) * 100)}
          count={answerCountMap?.[false]?.count ?? 0}
          enableOpacity={props.lobby.game.state === QUESTION_TIMEOUT && props.question.answer}
        />
      </div>
    );

  if ([triviaQuestionsTypes.shortAnswer.key, triviaQuestionsTypes.brainstorm.key].includes(props.question?.type))
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-7  mx-6">
        {Object.entries(answerCountMap).map((answerCountEntry, i) => (
          <OpenAnswerCellResult
            key={`open-answer-${i}`}
            isBrainStorm={isBrainStorm}
            count={answerCountEntry[1]?.count}
            isCorrect={checkIsCorrect(props.question, answerCountEntry[0])}
            answer={answerCountEntry[0]}
          />
        ))}
      </div>
    );

  return spinLoaderMin();
};
