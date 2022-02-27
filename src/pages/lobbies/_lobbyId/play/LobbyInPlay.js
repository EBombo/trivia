import React, { useEffect, useGlobal, useState } from "reactn";
import { UserLayout } from "../userLayout";
import { ButtonAnt } from "../../../../components/form";
import dynamic from "next/dynamic";
import get from "lodash/get";
import { useRouter } from "next/router";
import { config, firestore, hostName } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
import { darkTheme } from "../../../../theme";
import defaultTo from "lodash/defaultTo";
import isEmpty from "lodash/isEmpty";
import { Image } from "../../../../components/common/Image";
import { LobbyHeader } from "./LobbyHeader"
import { AnswerCard } from "./AnswerCard"
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard"
import { OpenAnswerCard } from "./OpenAnswerCard"
import { NextRoundLoader } from "./NextRoundLoader"

const ALTERNATIVE = 'alternative';
const TRUE_OR_FALSE = 'truefalse';
const OPEN = 'open';

const LOADING_STATE = 'LOADING';
const QUESTION_RESULT_STATE = 'QUESTION_RESULT';

export const LobbyInPlay = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [options, setOptions] = useState([]);
  const [isVisibleModalSettings, setIsVisibleModalSettings] = useState(false);
  const [isVisibleModalConfirm, setIsVisibleModalConfirm] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [isVisibleModalMessage, setIsVisibleModalMessage] = useState(false);
  const [winner, setWinner] = useState(null);

  // const typeAnswer = TRUE_OR_FALSE;
  // const typeAnswer = ALTERNATIVE;
  const typeAnswer = OPEN;

  if (props.lobby.game?.state === LOADING_STATE)
    return (
      <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto text-center flex flex-col justify-center">
        <div className="my-4">
          <NextRoundLoader/>
        </div>
        <div class="font-bold text-whiteLight text-xl">¿Te sientes confiado?</div>
      </div>);

  if (props.lobby.game?.state !== QUESTION_RESULT_STATE)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen min-h-screen overflow-auto text-center">
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <div className="relative my-4 mx-4 pt-8 pb-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
            <div className="absolute top-[-20px] left-1/2 translate-x-[-50%] bg-success rounded max-w-[250px] whitespace-nowrap px-8 text-secondaryDarken">
              <span className="inline-block py-4 pr-4 align-middle">
                <Image src={`${config.storageUrl}/resources/check-with-depth.svg`} width="16px"/>
              </span>
              Respuesta correcta
            </div>

            <div className="text-black"><span className="inline-block py-4 align-middle"><Image src={`${config.storageUrl}/resources/red-fire-streak.svg`} width="12px"/></span> Racha de respuestas: 8</div>
            <div className="text-black text-3xl py-8">+600 puntos</div>
            <div className="text-black">Puntaje actual: 1500 pts</div>
            <div className="text-black">Puesto: 25/200</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <LobbyHeader/>
      <div className="grid md:grid-cols-[1fr_3fr_1fr] mb-8 bg-secondaryDark bg-opacity-50 py-8">
        <div className="text-center self-end">
          <span className="text-whiteLight text-lg cursor-pointer">Finalizar</span>
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {typeAnswer === ALTERNATIVE
          ? (<>
            <AnswerCard color="red"/>
            <AnswerCard color="green" />
            <AnswerCard color="yellow" />
            <AnswerCard color="blue" />
          </>)
          : typeAnswer === TRUE_OR_FALSE
          ? (<>
            <TrueFalseAnswerCard color="red" value={true} />
            <TrueFalseAnswerCard color="green" value={false} />
          </>)
          : typeAnswer === OPEN
          ? (<div className="col-start-1 col-end-3" >
            <OpenAnswerCard color="red" value={true} />
          </div>)
          : null}
        </div>
      </div>
      <div className="text-whiteLight flex flex-col md:flex-row md:justify-between items-center mx-4 py-4">
        <div className="text-lg md:text-2xl px-4 py-2">
          <span>Entra a </span>
          <span className="font-bold">{hostName}</span>
        </div>
        <div className="text-2xl px-4 py-2">
          <span>PIN </span>
          <span>{props.lobby?.pin}</span>
        </div>
      </div>
    </div>
  );
};

