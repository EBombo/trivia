import React, { useEffect, useState, useRef, useCallback } from "reactn";
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
import styled from "styled-components";
import { animate } from "popmotion"

const TOTAL_ANIMATION_DURATION = 6000;

export const LobbyQuestionIntroduction = (props) => {
  const currentQuestionNumber = props.lobby?.game?.currentQuestionNumber ?? 1;
  const [question, setQuestion] = useState(props.question);

  const imgSizeRef = useRef(null);

  const imgRef = useCallback(node => {
    if (!node) return;

    animate({
      from: 1,
      to: 0.5,
      duration: 1000,
      elapsed: -2000,
      onUpdate: tween => {
        if (!imgSizeRef.current) imgSizeRef.current = node.offsetHeight;

        node.style.height = `${imgSizeRef.current * tween}px`;
        node.style.width = `${imgSizeRef.current * tween}px`;
      }
    });
  }, []);

  useEffect(() => {
    const updateLobby = async () => {
      await timeoutPromise(TOTAL_ANIMATION_DURATION);

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

  const questionLabel = (label) => (
    <div className="absolute top-0 left-0 w-full text-white text-6xl text-center pt-6 question-type-anim">{label}</div>
  );

  const showQuestion = (label) => (
    <div className={`absolute top-0 left-0
      w-full text-black text-4xl text-center opacity-0 question-anim
      bg-white
      py-20
    `}>{label}</div>
  );

  // add animation for question
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto flex justify-center items-center">
      <LobbyQuestionIntroductionContent {...props} >
        {question.type === ALTERNATIVES_QUESTION_TYPE ? (
          <>
            <Image innerRef={imgRef} className="img" src={`${config.storageUrl}/resources/alternative-question-logo.svg`} width="150px" height="150px" desktopWidth="250px" desktopHeight="250px" />
            <div className="relative min-h-[320px]">
              {questionLabel("Quiz")}
              {showQuestion(question.question)}
            </div>
          </>
        ) : question.type === TRUE_FALSE_QUESTION_TYPE ? (
          <>
            <Image innerRef={imgRef} className="img" src={`${config.storageUrl}/resources/true-false-question-logo.svg`} width="150px" height="150px" desktopWidth="250px" desktopHeight="250px" />
            <div className="relative min-h-[320px]">
              {questionLabel("Verdadero o Falso")}
              {showQuestion(question.question)}
            </div>
          </>
        ) : question.type === OPEN_QUESTION_TYPE ? (
          <>
            <Image innerRef={imgRef} className="img" src={`${config.storageUrl}/resources/open-question-logo.svg`} width="150px" height="150px" desktopWidth="250px" desktopHeight="250px" />
            <div className="relative min-h-[320px]">
              {questionLabel("Escribe tu respuesta")}
              {showQuestion(question.question)}
            </div>
          </>
        ) : null}
      </LobbyQuestionIntroductionContent>
    </div>
  );
};

const LobbyQuestionIntroductionContent = styled.div`
  width: 100%;

  .question-type-anim {
    animation: introducingQuestionType ${TOTAL_ANIMATION_DURATION/2}ms forwards;
  }

  .question-anim {
    animation: introducingQuestion ${TOTAL_ANIMATION_DURATION/2}ms forwards;
    animation-delay: ${TOTAL_ANIMATION_DURATION/2}ms
  }

  @keyframes introducingQuestionType {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes introducingQuestion {
    0% {
      opacity: 0;

    }
    100% {
      opacity: 1;
    }
  }

`;

