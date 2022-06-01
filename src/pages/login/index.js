import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import { firestore } from "../../firebase";
import { NicknameStep } from "./NicknameStep";
import { snapshotToArray } from "../../utils";
import { EmailStep } from "./EmailStep";
import { useRouter } from "next/router";
import { useUser, useTranslation } from "../../hooks";
import { PinStep } from "./PinStep";
import { avatars } from "../../components/common/DataList";
import { Anchor } from "../../components/form";
import { firebase } from "../../firebase/config";
import { saveMembers } from "../../constants/saveMembers";
import { fetchUserByEmail } from "./fetchUserByEmail";
import { Tooltip } from "antd";
import { useFetch } from "../../hooks/useFetch";
import { reserveLobbySeat } from "../../business";

const Login = (props) => {
  const router = useRouter();
  const { pin } = router.query;

  const { Fetch } = useFetch();

  const { t, SwitchTranslation } = useTranslation();

  const [, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const [isLoading, setIsLoading] = useState(false);

  const fetchLobby = async (pin, avatar = avatars[0]) => {
    try {
      // Fetch lobby.
      const lobbyRef = await firestore.collection("lobbies").where("pin", "==", pin.toString()).limit(1).get();

      if (lobbyRef.empty) throw Error(t("pages.login.game-not-found"));

      const currentLobby = snapshotToArray(lobbyRef)[0];

      if (currentLobby?.isLocked) throw Error(t("pages.login.game-is-closed"));

      if (currentLobby?.isClosed) {
        await setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });

        throw Error(t("pages.login.lobby-is-over"));
      }

      const isAdmin = !!currentLobby?.game?.usersIds?.includes(authUser.id);

      await setAuthUser({ avatar, ...authUser, lobby: currentLobby, isAdmin });
      setAuthUserLs({ avatar, ...authUser, lobby: currentLobby, isAdmin });
    } catch (error) {
      props.showNotification("UPS", error.message, "warning");
    }
    setIsLoading(false);
  };

  // Redirect to lobby.
  useEffect(() => {
    if (!authUser?.lobby) return;
    if (!authUser?.nickname) return;
    if (authUser?.lobby?.settings?.userIdentity && !authUser?.email) return;

    // Determine is necessary create a user.
    const initialize = async () => {
      // Fetch lobby.
      const lobbyRef = await firestore.doc(`lobbies/${authUser.lobby.id}`).get();
      const lobby = lobbyRef.data();

      if (lobby?.isClosed) {
        return setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });
      }

      // AuthUser is admin.
      if (authUser.lobby?.game?.usersIds?.includes(authUser.id))
        return router.push(`/trivia/lobbies/${authUser.lobby.id}`);

      // Replace "newUser" if user has already logged in before with the same email.
      const user_ = authUser?.email ? await fetchUserByEmail(authUser.email, authUser.lobby.id) : null;

      // If user has already logged then redirect.
      if (user_) {
        await setAuthUser(user_);
        setAuthUserLs(user_);
        return router.push(`/trivia/lobbies/${authUser.lobby.id}`);
      }

      // If lobby is awaiting for players then redirect to lobby.
      if (!(!!lobby?.startAt || lobby?.isPlaying)) return router.push(`/trivia/lobbies/${authUser.lobby.id}`);

      // Else if lobby is playing then register user in firestore. This skips
      // Realtime Database registration flow
      const userId = authUser?.id ?? firestore.collection("users").doc().id;

      let newUser = {
        id: userId,
        userId,
        email: authUser?.email ?? null,
        nickname: authUser.nickname,
        avatar: authUser?.avatar ?? null,
        lobbyId: lobby?.id,
        lobby,
      };

      try {
        await reserveLobbySeat(Fetch, authUser.lobby.id, userId, newUser);

        // Update metrics.
        const promiseMetric = firestore.doc(`games/${lobby.gameId}`).update({
          countPlayers: firebase.firestore.FieldValue.increment(1),
        });

        // Register user as a member in company.
        const promiseMember = saveMembers(authUser.lobby, [newUser]);

        await Promise.all([promiseMetric, promiseMember]);

        await setAuthUser(newUser);
        setAuthUserLs(newUser);

        // Redirect to lobby.
        await router.push(`/trivia/lobbies/${authUser.lobby.id}`);
      } catch (e) {
        props.showNotification(t("verify-lobby-availability-error-title"), e?.message);

        return setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });
      }
    };

    initialize();
  }, [authUser]);

  // Fetch lobby to auto login.
  useEffect(() => {
    if (!authUser?.lobby?.pin) return;

    setIsLoading(true);
    fetchLobby(authUser.lobby.pin);
  }, []);

  // Auto fetch lobby.
  useEffect(() => {
    if (!pin) return;

    setIsLoading(true);
    fetchLobby(pin);
  }, [pin]);

  const emailIsRequired = useMemo(() => {
    return !!authUser?.lobby?.settings?.userIdentity;
  }, [authUser]);

  const goToPinStep = useMemo(
    () => (
      <div className=" w-full flex justify-center py-0 px-4">
        <Anchor
          underlined
          variant="white"
          fontSize="16px"
          onClick={async () => {
            await setAuthUser({
              ...authUser,
              email: null,
              nickname: null,
              lobby: null,
            });
            setAuthUserLs({
              ...authUser,
              email: null,
              nickname: null,
              lobby: null,
            });
          }}
        >
          {t("pages.login.go-back")}
        </Anchor>
      </div>
    ),
    []
  );

  return (
    <div className="relative bg-secondary w-full h-screen bg-center bg-contain bg-lobby-pattern">
      <div className="absolute top-4 right-4 lg:top-10 lg:right-10">
        <SwitchTranslation />
      </div>

      <div className="p-[10px] max-w-[400px] my-0 mx-auto">
        {!authUser?.lobby && (
          <>
            <PinStep isLoading={isLoading} setIsLoading={setIsLoading} fetchLobby={fetchLobby} {...props} />
            {authUser?.email ||
              (authUser?.nickname && (
                <div className="back">
                  <Tooltip title={`email: ${authUser.email} nickname: ${authUser.nickname}`} placement="bottom">
                    <Anchor
                      underlined
                      variant="white"
                      fontSize="11px"
                      margin="10px auto"
                      onClick={async () => {
                        await setAuthUser({
                          ...authUser,
                          email: null,
                          nickname: null,
                          lobby: null,
                        });
                        setAuthUserLs({
                          ...authUser,
                          email: null,
                          nickname: null,
                          lobby: null,
                        });
                      }}
                    >
                      {t("pages.login.remove-email-nickname")}
                    </Anchor>
                  </Tooltip>
                </div>
              ))}
          </>
        )}

        {authUser?.lobby && (
          <>
            {emailIsRequired && !authUser?.email && (
              <>
                <EmailStep isLoading={isLoading} setIsLoading={setIsLoading} {...props} />
                {goToPinStep}
              </>
            )}

            {(emailIsRequired && authUser?.email && !authUser.nickname) || (!emailIsRequired && !authUser?.nickname) ? (
              <>
                <NicknameStep isLoading={isLoading} setIsLoading={setIsLoading} {...props} />
                {goToPinStep}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
