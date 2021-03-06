import React, { useEffect, useGlobal, useRef, useState } from "reactn";
import { bomboGamesDomain, firestore } from "../../../firebase";
import { useRouter } from "next/router";
import { spinLoaderMin } from "../../../components/common/loader";
import { LobbyUser } from "./LobbyUser";
import { LobbyLoading } from "./LobbyLoading";
import { LobbyClosed } from "./closed/LobbyClosed";
import { LobbyInPlay } from "./play/LobbyInPlay";
import { useUser } from "../../../hooks";
import { snapshotToArray } from "../../../utils";
import UrlAssembler from "url-assembler";
import { timeoutPromise } from "../../../utils/promised";

export const Lobby = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  const audioRef = useRef(null);

  const [authUserLs, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const [game, setGame] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login.
    if (!authUser?.nickname && !authUser.isAdmin && typeof window !== "undefined") window.location.href = "/";
  }, [authUser]);

  const logout = async (isClosed = false, _lobby = null) => {
    let feedbackUrl;

    if (isClosed && _lobby) {
      feedbackUrl = UrlAssembler(bomboGamesDomain)
        .template("/lobbies/:lobbyId/users/:userId")
        .param("lobbyId", _lobby.id)
        .param("userId", authUser.id)
        .toString();
    }

    const userMapped = {
      id: firestore.collection("users").doc().id,
      email: authUserLs?.email,
      avatar: authUserLs?.avatar,
      nickname: authUserLs?.nickname,
    };

    await setAuthUser(userMapped);
    setAuthUserLs(userMapped);

    if (typeof window !== "undefined") {
      window.location.href = feedbackUrl ?? "/";
      await timeoutPromise(5000);
    }
  };

  // Fetch lobby.
  useEffect(() => {
    if (!lobbyId) return;

    const fetchQuestions = async () => {
      const gameQuestionsSnapshot = await firestore.collection(`lobbies/${lobbyId}/gameQuestions`).get();

      return snapshotToArray(gameQuestionsSnapshot);
    };

    const fetchLobby = () =>
      firestore.doc(`lobbies/${lobbyId}`).onSnapshot(async (lobbyRef) => {
        const currentLobby = lobbyRef.data();

        // Lobby not found.
        if (!currentLobby) {
          props.showNotification("UPS", "No encontramos tu sala, intenta nuevamente", "warning");
          logout();
        }

        // If the game is closed logout user.
        if (currentLobby?.isClosed && !authUser.isAdmin) return logout(true, currentLobby);

        setAuthUserLs({ ...authUser, lobby: currentLobby });
        await setAuthUser({ ...authUser, lobby: currentLobby });

        if (!lobby?.gameQuestions) {
          currentLobby.gameQuestions = await fetchQuestions();
        }

        setLobby(currentLobby);
      });

    const unSubLobby = fetchLobby();
    return () => unSubLobby && unSubLobby();
  }, [lobbyId]);

  // Fetch Game
  useEffect(() => {
    if (!lobby) return;

    const gameId = lobby.gameId || lobby.game?.id;
    const fetchGame = () =>
      firestore.doc(`games/${gameId}`).onSnapshot((gameRef) => {
        const _game = gameRef.data();
        setGame(_game);
        setLoading(false);
      });

    const unSubGame = fetchGame();
    return () => unSubGame && unSubGame();
  }, [lobby]);

  if (isLoading || (!authUser?.nickname && !authUser?.isAdmin) || !lobby || !game) return spinLoaderMin();

  const additionalProps = {
    lobby,
    audioRef: audioRef,
    logout: logout,
    game,
    ...props,
  };

  const lobbyIsClosed = lobby?.isClosed && authUser?.isAdmin;

  /** Game report. **/
  if (lobbyIsClosed) return <LobbyClosed {...additionalProps} />;

  /** The game is playing. **/
  if (lobby?.isPlaying) return <LobbyInPlay {...additionalProps} />;

  /** Loading page. **/
  if (lobby?.startAt) return <LobbyLoading {...additionalProps} />;

  /** Before starting the game. **/
  return <LobbyUser {...additionalProps} />;
};
