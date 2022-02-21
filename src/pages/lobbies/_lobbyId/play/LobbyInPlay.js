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


  return (
    <div className="bg-secondary w-screen bg-center bg-contain bg-lobby-pattern overflow-auto">
      <LobbyHeader/>
    </div>
  );
};

