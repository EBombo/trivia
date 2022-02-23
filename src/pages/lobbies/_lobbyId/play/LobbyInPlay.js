import React, { useEffect, useGlobal, useState } from "reactn";
import { UserLayout } from "../userLayout";
import { ButtonAnt } from "../../../../components/form";
import dynamic from "next/dynamic";
import get from "lodash/get";
import { useRouter } from "next/router";
import { config, firestore } from "../../../../firebase";
import { snapshotToArray } from "../../../../utils";
import { darkTheme } from "../../../../theme";
import defaultTo from "lodash/defaultTo";
import isEmpty from "lodash/isEmpty";
import { Image } from "../../../../components/common/Image";
import { LobbyHeader } from "./LobbyHeader"
import { AnswerCard } from "./AnswerCard"
import { TrueFalseAnswerCard } from "./TrueFalseAnswerCard"
import { OpenAnswerCard } from "./OpenAnswerCard"

const ALTERNATIVE = 'alternative';
const TRUE_OR_FALSE = 'truefalse';
const OPEN = 'open';

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

  return (
    <div className="font-['Lato'] font-bold bg-secondary w-screen min-h-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <LobbyHeader/>
      <div className="grid md:grid-cols-[1fr_3fr_1fr]">
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
      
    </div>
  );
};

