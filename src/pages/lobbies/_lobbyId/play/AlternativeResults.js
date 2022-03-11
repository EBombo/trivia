import React, { useGlobal, useMemo, useEffect, useState } from "reactn";
import { useRouter } from "next/router";
import { auth, config, firebase, firestore, hostName } from "../../../../firebase";
import { spinLoaderMin } from "../../../../components/common/loader";
import entries from "lodash/entries";
import { BarResult } from "./BarResult";
import { TrueFalseBarResult } from "./TrueFalseBarResult";
import { OpenAnswerCellResult } from "./OpenAnswerCellResult";
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

export const AlternativeResults = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [answerCountMap, setAnswerCountMap] = useState({});

  const totalCount = useMemo(
    () => Object.values(answerCountMap).reduce((acc, answer) => acc + answer.count, 0),
    [answerCountMap]
  );

  useEffect(() => {
    if (!props.question) return;

    const fetchBarResult = async () => {
      const answersSnapshot = await firestore
        .collection(`lobbies/${lobbyId}/answers`)
        .where("questionId", "==", props.question?.id)
        .get();

      const answerCountMap_ = answersSnapshot.docs.reduce((acc, answerSnapshot, i) => {
        const answer = answerSnapshot.data();

        if (!(answer.answer in acc)) acc[answer.answer] = { count: 0 };

        acc[answer.answer].count += 1;

        return acc;
      }, {});

      setAnswerCountMap({ ...answerCountMap_ });
    };

    fetchBarResult();
  }, [props.question]);

  if (!props.question) return spinLoaderMin();

  if (props.question?.type === ALTERNATIVES_QUESTION_TYPE)
    return (
      <div>
        {props.question.options.map((option, i) => (
          <BarResult
            key={`result-option-${i}`}
            isCorrect={props.question?.answer.includes(i)}
            color={i === 0 ? "red" : i === 1 ? "green" : i === 2 ? "yellow" : i === 3 ? "blue" : "primary"}
            value={Math.ceil(((answerCountMap[option]?.count ?? 0) / totalCount) * 100)}
            count={answerCountMap[option]?.count ?? 0}
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
        />
        <TrueFalseBarResult
          isCorrect={!props.question?.answer}
          option={false}
          value={Math.ceil(((answerCountMap?.[false]?.count ?? 0) / totalCount) * 100)}
          count={answerCountMap?.[false]?.count ?? 0}
        />
      </div>
    );

  if (props.question?.type === OPEN_QUESTION_TYPE)
    return (
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(answerCountMap).map((answerCountEntry, i) => (
          <OpenAnswerCellResult
            key={`open-answer-${i}`}
            count={answerCountEntry[1]?.count}
            isCorrect={props.question?.answer.includes(answerCountEntry[0])}
            answer={answerCountEntry[0]}
          />
        ))}
      </div>
    );

  return spinLoaderMin();
};
