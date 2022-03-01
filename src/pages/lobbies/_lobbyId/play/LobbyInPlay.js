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
import { Footer } from "./Footer"
import { BarResult } from "./BarResult"
import { TrueFalseBarResult } from "./TrueFalseBarResult"
import { OpenAnswerCellResult } from "./OpenAnswerCellResult"
import { ResultCard } from "./ResultCard"
import { Scoreboard } from "./Scoreboard"
import { getIconUrl } from "../../../../components/common/DataList";

const ALTERNATIVE = 'alternative';
const TRUE_OR_FALSE = 'truefalse';
const OPEN = 'open';

const LOADING_STATE = 'LOADING';
const QUESTION_RESULT_STATE = 'QUESTION_RESULT';
const SHOW_RANKING_STATE = 'SHOW_RANKING_STATE';

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

  const [showImage, setShowImage] = useState(false);


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

  if (props.lobby.game?.state === SHOW_RANKING_STATE)
    return (
      <Scoreboard/>
    );

  if (props.lobby.game?.state === QUESTION_RESULT_STATE)
    return (
      <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen min-h-screen overflow-auto text-center">
        <div className="min-h-screen flex flex-col justify-center bg-secondaryDark bg-opacity-50">
          <ResultCard/>
        </div>
      </div>
    );

  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <LobbyHeader>
        {showImage
        ? (<div className="aspect-[4/1] w-full bg-secondaryDark"></div>)
        : (<div className="aspect-[4/1] w-full">
          { (typeAnswer === ALTERNATIVE)
            ? (<div>
                <BarResult color="red" value={20} count={8} />
                <BarResult color="green" value={50} count={12} />
                <BarResult color="yellow" value={91} count={2} />
                <BarResult color="blue" value={20} count={4} />
              </div>)
            : (typeAnswer === TRUE_OR_FALSE)
            ? (<div>
                <TrueFalseBarResult option={true} value={91} count={2} />
                <TrueFalseBarResult option={false} value={20} count={4} />
              </div>)
            : (typeAnswer === OPEN)
            ? (<div className="grid grid-cols-4 gap-2">
                {[{}].map((_, i) => (
                  <OpenAnswerCellResult key={`open-answer-${i}`} count={0} isCorrect={false} answer={'A'} />
                ))}
              </div>)
            : null
          }
          </div>
        )}
        <div><span className="cursor-pointer underline"
              onClick={() => setShowImage((oldValue) => !oldValue)}>Mostrar imagen</span></div>
      </LobbyHeader>
      <div className="grid md:grid-cols-[1fr_3fr_1fr] mb-8 bg-secondaryDark bg-opacity-50 py-8">
        <div className="text-center self-end">
          <span className="text-whiteLight text-lg cursor-pointer">Finalizar</span>
        </div>
        <div className="grid md:grid-cols-2 md:col-start-2 md:col-end-3">
          {typeAnswer === ALTERNATIVE
          ? (<>
            <AnswerCard color="red" />
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
      <Footer/>
    </div>
  );
};

