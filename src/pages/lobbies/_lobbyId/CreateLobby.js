import { spinLoaderMin } from "../../../components/common/loader";
import React, { useEffect, useGlobal, useState } from "reactn";
import { config, firestore, firestoreBomboGames } from "../../../firebase";
import { useFetch } from "../../../hooks/useFetch";
import defaultTo from "lodash/defaultTo";
import { useRouter } from "next/router";
import { useSendError, useUser } from "../../../hooks";
import { GameMenu } from "../../../components/GameMenu";

export const CreateLobby = (props) => {
  const { Fetch } = useFetch();

  const router = useRouter();
  const { userId, tokenId, gameId } = router.query;

  const { sendError } = useSendError();

  const [, setLSAuthUser] = useUser();

  const [audios] = useGlobal("audios");
  const [, setAuthUser] = useGlobal("user");

  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if ((!tokenId && !userId) || !gameId) return;

    const verifyUser = async () => {
      try {
        const url = `${config.serverUrlEvents}/api/tokens`;
        const { response, error } = await Fetch(url, "POST", { tokenId, userId });

        if (error) {
          props.showNotification("ERROR", "Error al validar la cuenta");

          if (typeof window !== "undefined") window.location.href = "/";
          return;
        }

        return response.user;
      } catch (error) {
        console.error(error);
      }
    };

    const fetchGame = async () => {
      const gameRef = await firestore.doc(`games/${gameId}`).get();
      return gameRef.data();
    };

    const fetchUserByToken = async () => {
      try {
        const promiseUser = verifyUser();
        const promiseGame = fetchGame();

        const response = await Promise.all([promiseUser, promiseGame]);

        const authUser = response[0];
        const game = response[1];

        const formatUser = {
          id: authUser.uid,
          nickname: authUser.name,
          email: authUser.email,
          isAdmin: true,
        };

        if (!game.usersIds.includes(formatUser.id) && typeof window !== "undefined") {
          window.location.href = "/";
          return;
        }

        await setAuthUser(formatUser);
        setLSAuthUser(formatUser);
        setGame(game);
        setSettings({ ...settings });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserByToken();
  }, [tokenId, gameId]);

  const createLobby = async (typeOfGame) => {
    setIsLoadingSave(true);
    try {
      const pin = await generatePin();

      const lobbiesRef = firestore.collection("lobbies");
      const lobbiesBomboGamesRef = firestoreBomboGames.collection("lobbies");
      const lobbyId = lobbiesRef.doc().id;

      //TODO: add roulette config
      const newLobby = {
        id: lobbyId,
        pin,
        game,
        gameId: game.id,
        updateAt: new Date(),
        createAt: new Date(),
        startAt: null,
        isLocked: false,
        isClosed: false,
        deleteDuplicated: false,
        notDoublePrice: true,
        settings: {
          ...settings,
          audio: settings.audio ?? { id: audios[0]?.id },
        },
      };

      const promiseLobby = lobbiesRef.doc(lobbyId).set(newLobby);
      const promiseLobbyBomboGames = lobbiesBomboGamesRef.doc(lobbyId).set(newLobby);

      const promiseCountPlays = firestore.doc(`games/${game.id}`).update({ countPlays: (game?.countPlays ?? 0) + 1 });

      await Promise.all([promiseLobby, promiseLobbyBomboGames, promiseCountPlays]);

      if (!game.isLive) {
        const gameOptionsQuery = await firestore.collection("games").doc(gameId).collection("options").get();

        const gameOptions = snapshotToArray(gameOptionsQuery);

        gameOptions.map(async (option) => {
          await firestore
            .doc(`lobbies/${lobbyId}`)
            .collection("options")
            .doc(option.id)
            .set({ ...option });
        });
      }

      return router.push(`/trivia/lobbies/${lobbyId}`);
    } catch (error) {
      console.log(error);
      sendError(error, "createLobby");
    }
    setIsLoadingSave(false);
  };

  const generatePin = async () => {
    const pin = Math.floor(100000 + Math.random() * 900000);
    const isValid = await validatePin(pin);

    return isValid && pin > 99999 ? pin.toString() : await generatePin();
  };

  const validatePin = async (pin) => {
    const gamesRef = await firestoreBomboGames.collection("lobbies").where("pin", "==", pin).get();

    return gamesRef.empty;
  };

  if (isLoading) return spinLoaderMin();

  return (
    <div className="bg-secondary w-full h-screen bg-center bg-contain bg-lobby-pattern">
      <GameMenu
        {...props}
        game={game}
        audios={audios}
        showChooseGameMode
        settings={settings}
        createLobby={createLobby}
        isLoadingSave={isLoadingSave}
        onAudioChange={(audioId) => setSettings({ ...settings, audio: { id: audioId } })}
        onLanguageChange={(language) => setSettings({ ...settings, language })}
        onUserIdentity={(userIdentity) => setSettings({ ...settings, userIdentity })}

        onAwards={(awards) => setSettings({ ...settings, awards })}
      />
    </div>
  );
};
