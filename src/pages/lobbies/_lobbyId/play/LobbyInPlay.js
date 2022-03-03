import React, { useEffect, useGlobal, useState } from "reactn";
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
import { LobbyHeader } from "./LobbyHeader";
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
import { ALTERNATIVES_QUESTION_TYPE, ANSWERING_QUESTION, getIconUrl, INTRODUCING_QUESTION, OPEN_QUESTION_TYPE, RANKING, TRUE_FALSE_QUESTION_TYPE } from "../../../../components/common/DataList";

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [questions, setQuestions] = useState(props.lobby.game.questions ?? []);

  const [question, setQuestion] = useState(null);

  const [showImage, setShowImage] = useState(false);

  const currentQuestionNumber = props.lobby.game.currentQuestionNumber ?? 1;

  useEffect(() => {
    const question_ = getCurrentQuestion(questions, currentQuestionNumber);
    if (question_) setQuestion(question_);

    if (authUser.isAdmin) {
    }
  }, []);

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

  if (props.lobby.game?.state === INTRODUCING_QUESTION) return (<LobbyQuestionIntroduction/>);

  // if user has already answered
  // TODO  check variable if user has answered
  if (!authUser.isAdmin && props.lobby.game?.state === ANSWERING_QUESTION)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <div className="my-4">
          <NextRoundLoader />
        </div>
        <div class="font-bold text-whiteLight text-xl">¿Te sientes confiado?</div>
      </div>
    );

  if (props.lobby.game?.state === RANKING) return <Scoreboard />;

  if (props.lobby.game?.state === QUESTION_RESULTS && !authUser.isAdmin)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen min-h-screen overflow-auto text-center">
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <ResultCard />
        </div>
      </div>
    );

  // ANSWERING_QUESTION state
  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <LobbyHeader>
        {showImage ? (
          <div className="aspect-[4/1] w-full bg-secondaryDark"></div>
        ) : (
          <div className="aspect-[4/1] w-full">
            {question.type === ALTERNATIVES_QUESTION_TYPE ? (
              <div>
                <BarResult color="red" value={20} count={8} />
                <BarResult color="green" value={50} count={12} />
                <BarResult color="yellow" value={91} count={2} />
                <BarResult color="blue" value={20} count={4} />
              </div>
            ) : question.type === TRUE_FALSE_QUESTION_TYPE ? (
              <div>
                <TrueFalseBarResult option={true} value={91} count={2} />
                <TrueFalseBarResult option={false} value={20} count={4} />
              </div>
            ) : question.type === OPEN_QUESTION_TYPE ? (
              <div className="grid grid-cols-4 gap-2">
                {[{}].map((_, i) => (
                  <OpenAnswerCellResult key={`open-answer-${i}`} count={0} isCorrect={false} answer={"A"} />
                ))}
              </div>
            ) : null}
          </div>
        )}
        <div>
          <span className="cursor-pointer underline" onClick={() => setShowImage((oldValue) => !oldValue)}>
            Mostrar imagen
          </span>
        </div>
      </LobbyHeader>

      <div className="grid md:grid-cols-[1fr_3fr_1fr] mb-8 bg-secondaryDark bg-opacity-50 py-8">
        <div className="text-center self-end">
          <span className="text-whiteLight text-lg cursor-pointer">Finalizar</span>
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {question.type === ALTERNATIVES_QUESTION_TYPE
            ? question.options.map((option, i) => (
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
            : question.type === TRUE_FALSE_QUESTION_TYPE ? (
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
          ) : question.type === OPEN_QUESTION_TYPE ? (
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
