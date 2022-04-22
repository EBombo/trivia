import React, { useEffect, useMemo, useState } from "reactn";
import { useRouter } from "next/router";
import { firestore } from "../../../../firebase";
import { spinLoaderMin } from "../../../../components/common/loader";
import { checkIsCorrect } from "../../../../business";
import { AlternativeBarResult } from "./AlternativeBarResult";
import { TrueFalseBarResult } from "./TrueFalseBarResult";
import { OpenAnswerCellResult } from "./OpenAnswerCellResult";
import {
  ALTERNATIVES_QUESTION_TYPE,
  OPEN_QUESTION_TYPE,
  QUESTION_TIMEOUT,
  TRUE_FALSE_QUESTION_TYPE,
} from "../../../../components/common/DataList";

export const QuestionResults = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

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

  if (props.question?.type === ALTERNATIVES_QUESTION_TYPE)
    return (
      <div>
        {props.question.options.map((option, i) => (
          <AlternativeBarResult
            key={`result-option-${i}`}
            isCorrect={props.question?.answer.includes(i)}
            color={i === 0 ? "red" : i === 1 ? "green" : i === 2 ? "yellow" : i === 3 ? "blue" : "primary"}
            value={Math.ceil(((answerCountMap[option]?.count ?? 0) / totalCount) * 100)}
            count={answerCountMap[option]?.count ?? 0}
            enableOpacity={
              props.lobby.game.state === QUESTION_TIMEOUT &&
              !props.question.answer.map((answerIndex) => props.question?.options[answerIndex])?.includes(option)
            }
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

  if (props.question?.type === OPEN_QUESTION_TYPE)
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-7  mx-6">
        {Object.entries(answerCountMap).map((answerCountEntry, i) => (
          <OpenAnswerCellResult
            key={`open-answer-${i}`}
            count={answerCountEntry[1]?.count}
            isCorrect={checkIsCorrect(props.question, answerCountEntry[0])}
            answer={answerCountEntry[0]}
          />
        ))}
      </div>
    );

  return spinLoaderMin();
};
