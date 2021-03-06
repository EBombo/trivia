import { spinLoaderMin } from "../../../components/common/loader";
import React, { useEffect, useGlobal, useState } from "reactn";
import { config, firestore, firestoreBomboGames } from "../../../firebase";
import { useFetch } from "../../../hooks/useFetch";
import { useRouter } from "next/router";
import { useSendError, useTranslation, useUser } from "../../../hooks";
import { GameMenu } from "../../../components/GameMenu";
import { snapshotToArray } from "../../../utils";

export const CreateLobby = (props) => {
  const { Fetch } = useFetch();

  const router = useRouter();
  const { userId, tokenId, gameId } = router.query;

  const { sendError } = useSendError();

  const [, setLSAuthUser] = useUser();

  const { locale, setLocale } = useTranslation();

  const [audios] = useGlobal("audios");
  const [authUser, setAuthUser] = useGlobal("user");

  const [game, setGame] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [settings, setSettings] = useState({ language: locale });

  useEffect(() => {
    if (!gameId) return;
    if (!tokenId && !userId) return;

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

    const fetchGameQuestions = async () => {
      const questionsRef = await firestore.collection(`games/${gameId}/questions`).get();
      return snapshotToArray(questionsRef);
    };

    const fetchUserByToken = async () => {
      try {
        const promiseUser = verifyUser();
        const promiseGame = fetchGame();
        const promiseQuestions = fetchGameQuestions();

        const response = await Promise.all([promiseUser, promiseGame, promiseQuestions]);

        const authUser = response[0];
        const game = response[1];
        const questions = response[2];

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
        setGame({ ...game });
        setGameQuestions(questions);
        setSettings({ ...settings });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserByToken();
  }, [tokenId, gameId]);

  const fetchLimitByPlan = async (companyId) => {
    /** TODO: Consider remove [start]. **/
    const maxLimit = 3000;
    const usersWithoutLimit = ["tech@ebombo.com", "hello@ebombo.com"];

    if (usersWithoutLimit.includes(authUser.email)) return maxLimit;
    /** TODO: Consider remove [end]. **/

    if (!companyId) return defaultLimitByPlan;

    try {
      const { response, error } = await Fetch(`${config.serverUrlBomboGames}/companies/${companyId}`);

      if (error) {
        throw Error(error);
      }

      return +response.limitUsersBySubscription ?? defaultLimitByPlan;
    } catch (error) {
      console.error(error);
    }
    return defaultLimitByPlan;
  };

  const createLobby = async (typeOfGame) => {
    setIsLoadingSave(true);
    try {
      const pin = await generatePin();

      const lobbiesRef = firestore.collection("lobbies");
      const lobbiesBomboGamesRef = firestoreBomboGames.collection("lobbies");

      /** Fetch limit by plan. **/
      const limitByPlan = await fetchLimitByPlan(game?.user?.companyId);

      const lobbyId = lobbiesRef.doc().id;
      //TODO: add roulette config
      const newLobby = {
        id: lobbyId,
        pin,
        game,
        limitByPlan,
        gameId: game.id,
        updateAt: new Date(),
        createAt: new Date(),
        startAt: null,
        isLocked: false,
        isClosed: false,
        deleteDuplicated: false,
        notDoublePrice: true,
        countPlayers: 0,
        deleted: false,
        settings: {
          ...settings,
          audio: settings.audio ?? { id: audios[0]?.id },
        },
      };

      const promiseLobby = lobbiesRef.doc(lobbyId).set(newLobby);
      const promisesLobbyGameQuestions = gameQuestions.map((question) =>
        firestore.collection(`lobbies/${lobbyId}/gameQuestions`).doc(question.id).set(question)
      );

      const promiseLobbyBomboGames = lobbiesBomboGamesRef.doc(lobbyId).set(newLobby);

      const promiseCountPlays = firestore.doc(`games/${game.id}`).update({ countPlays: (game?.countPlays ?? 0) + 1 });

      await Promise.all([promiseLobby, promiseLobbyBomboGames, promiseCountPlays, ...promisesLobbyGameQuestions]);

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
        onLanguageChange={(language) => {
          setLocale(language);
          setSettings({ ...settings, language });
        }}
        onUserIdentity={(userIdentity) => setSettings({ ...settings, userIdentity })}
        onAwards={(awards) => setSettings({ ...settings, awards })}
      />
    </div>
  );
};
