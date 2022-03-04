import React, { useEffect, useState } from "reactn";
import find from "lodash/find";
import { config, firestore } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";
import {
  ALTERNATIVES_QUESTION_TYPE,
  ANSWERING_QUESTION,
  OPEN_QUESTION_TYPE,
  TRUE_FALSE_QUESTION_TYPE,
} from "../../../../components/common/DataList";
import { timeoutPromise } from "../../../../utils/promised";

export const LobbyQuestionIntroduction = (props) => {
  // props.lobby?.game?.questionNumber;
  const currentQuestionNumber = props.lobby?.game?.currentQuestionNumber ?? 1;
  const [question, setQuestion] = useState(props.question);

  useEffect(() => {
    const updateLobby = async () => {
      await timeoutPromise(10000);

      await firestore.doc(`lobbies/${props.lobby.id}`).update({
        game: { ...props.lobby.game, state: ANSWERING_QUESTION },
      });
    };

    updateLobby();
  }, []);

  useEffect(() => {
    const question_ = find(props.lobby?.game?.questions ?? [], (q) => q.questionNumber === currentQuestionNumber);
    if (!question_) return;

    setQuestion(question_);
  }, [props.lobby]);

  // add animation for question
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      {question.type === ALTERNATIVES_QUESTION_TYPE ? (
        <Image src={`${config.storageUrl}/resources/alternative-question-logo.svg`} width="150px" />
      ) : question.type === TRUE_FALSE_QUESTION_TYPE ? (
        <Image src={`${config.storageUrl}/resources/true-false-question-logo.svg`} width="150px" />
      ) : question.type === OPEN_QUESTION_TYPE ? (
        <Image src={`${config.storageUrl}/resources/open-question-logo.svg`} width="150px" />
      ) : null}
    </div>
  );
};
