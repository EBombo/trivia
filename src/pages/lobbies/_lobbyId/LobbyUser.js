import React, { useEffect, useGlobal, useRef, useState } from "reactn";
import { database } from "../../../firebase";
import { useRouter } from "next/router";
import styled from "styled-components";
import { MoreOutlined } from "@ant-design/icons";
import { config } from "../../../firebase/config";
import { useInView } from "react-intersection-observer";
import { LobbyHeader } from "./LobbyHeader";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Popover } from "antd";
import { useMemo } from "react";
import { spinLoaderMin, spinLoader } from "../../../components/common/loader";
import { Tablet } from "../../../constants";
import { Image } from "../../../components/common/Image";
import debounce from "lodash/debounce";
import moment from "moment";
import { UserLayout } from "./userLayout";
import { useFetch } from "../../../hooks/useFetch";

const userListSizeRatio = 50;
const currentTime = moment().format("x");

export const LobbyUser = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  const { Fetch } = useFetch();

  const [authUser] = useGlobal("user");

  const [users, setUsers] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isFetchUsersLoading, setIsFetchUsersLoading] = useState(true);
  const [userListSize, setUserListSize] = useState(0);
  const { ref: scrollTriggerRef, inView } = useInView({ threshold: 0 });

  const userRef = useRef(null);
  const unSub = useRef(null);

  // Common.
  useEffect(() => {
    if (!props.lobby) return;
    if (!inView) return;

    setIsFetchUsersLoading(true);
    const newUserListSizeRatio = userListSize + userListSizeRatio;

    // Realtime database cannot sort descending.
    // Reference orderByChild: https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#sort_data
    // Reference limitToLast: https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data
    const UsersQueryRef = database
      .ref(`lobbies/${lobbyId}/users`)
      .orderByChild("last_changed")
      .limitToLast(newUserListSizeRatio);

    const fetchUsers = () =>
      UsersQueryRef.on(
        "value",
        debounce((snapshot) => {
          let users_ = [];

          snapshot.forEach((docRef) => {
            const user = docRef.val();
            if (user.state.includes("online")) users_.unshift(user);
          });

          setUserListSize(newUserListSizeRatio);
          setIsFetchUsersLoading(false);
          setUsers(users_);
        }, 100)
      );

    const userQueryListener = fetchUsers();

    return () => UsersQueryRef?.off("value", userQueryListener);
  }, [inView]);

  // Create presence.
  useEffect(() => {
    if (!props.lobby) return;

    if (!authUser) return;
    if (!authUser.lobby) return;
    if (authUser.isAdmin) return;

    const mappedUser = {
      email: authUser?.email ?? null,
      userId: authUser?.id ?? null,
      nickname: authUser?.nickname ?? null,
      avatar: authUser?.avatar ?? null,
      lobbyId: props.lobby.id,
    };

    const isOfflineForDatabase = {
      ...mappedUser,
      state: "offline",
      last_changed: currentTime,
    };

    // TODO change field last_changed to a proper name (changedAt)
    const isOnlineForDatabase = {
      ...mappedUser,
      state: "online",
      last_changed: currentTime,
    };

    // Create reference.
    userRef.current = database.ref(`lobbies/${props.lobby.id}/users/${authUser.id}`);

    // Reference:
    // https://firebase.google.com/docs/firestore/solutions/presence
    const createPresence = () =>
      database.ref(".info/connected").on("value", async (snapshot) => {
        if (!snapshot.val()) return;

        // Reference: https://firebase.google.com/docs/reference/node/firebase.database.OnDisconnect
        await userRef.current.onDisconnect().set(isOfflineForDatabase);

        // verifies if lobby can let user in
        const verifyLobbyAvailability = async () => {
          setIsPageLoading(true);

          const result = await reserveLobbySeat(props.lobby.id, authUser.id, null);

          if (!result.success) {
            props.logout();
            return;
          }

          setIsPageLoading(false);

          await userRef.current.set(isOnlineForDatabase);
        };

        verifyLobbyAvailability();
      });

    unSub.current = createPresence();

    return () => userRef.current?.off("value", unSub.current);
  }, [authUser?.id]);

  // Disconnect presence when there is an unmounting task (tab closing on browser).
  useEffect(() => {
    // Update to offline when user doesn't have LOBBY and is not ADMIN.
    if (authUser?.lobby || authUser?.isAdmin) return;

    const isOfflineForDatabase = {
      state: "offline",
      userId: authUser?.id ?? null,
      email: authUser?.email ?? null,
      avatar: authUser?.avatar ?? null,
      nickname: authUser?.nickname ?? null,
      last_changed: currentTime,
    };

    return () => {
      userRef.current.set(isOfflineForDatabase);
      userRef.current?.off("value", unSub.current);
    };
  }, [authUser]);

  const reserveLobbySeat = async (lobbyId, userId, newUser) => {
    try {
      const fetchProps = {
        url: `${config.serverUrlBomboGames}/${gameName}/lobbies/${lobbyId}/seat`,
        method: "PUT",
      };

      const { error, response } = await Fetch(fetchProps.url, fetchProps.method, {
        userId,
        newUser,
      });

      if (error) throw new Error(error);

      return response;
    } catch (error) {
      sendError(error, "reserveLobbySeat");
      return error;
    }
  };

  const btnExit = useMemo(() => {
    if (!authUser) return null;
    if (authUser.isAdmin) return null;

    return (
      <Popover
        trigger="click"
        content={
          <div>
            <div onClick={async () => props.logout()} style={{ cursor: "pointer" }}>
              Salir
            </div>
          </div>
        }
      >
        <div className="icon-menu">
          <MoreOutlined />
        </div>
      </Popover>
    );
  }, [authUser]);

  if (isPageLoading) return spinLoader();

  return (
    <LobbyUserCss>
      <div className="bg-secondary bg-secondary w-full h-screen bg-center bg-contain bg-lobby-pattern md:w-auto">
        <UserLayout {...props} />
        <LobbyHeader {...props} />

        <div className="px-[15px] py-[10px] md: px-[5px]">
          {!authUser?.isAdmin && (
            <div className="notification-joint-user font-bold text-white bg-green-800 text-center sm:text-lg py-2">
              Entró correctamente al juego.
              <div className="inline-block bg-primary p-2 m-2 rounded shadow-xl">{authUser.nickname} (Tú)</div>
            </div>
          )}

          <Tablet>
            {!authUser?.isAdmin && (
              <div className="font-bold text-white text-lg text-center my-4">
                El administrador iniciará el juego pronto
              </div>
            )}
            <div className="user-count bg-primaryDark text-white font-bold rounded m-4 py-2 px-4 self-end w-min">
              <span className="whitespace-nowrap">
                <span className="align-text-top">{props.lobby?.countPlayers ?? 0}</span>
                <span className="w-[15px] inline-block"></span>
                <Image
                  className="inline-block align-sub"
                  src={`${config.storageUrl}/resources/user.svg`}
                  height="15px"
                  width="15px"
                  size="contain"
                />
              </span>
            </div>
          </Tablet>

          <TransitionGroup className="grid grid-cols-[1fr_1fr_1fr] max-w-[1000px] gap-[4px] mx-auto md:grid-cols-[1fr_1fr_1fr_1fr_1fr] md:gap-[10px] my-4">
            {users.map((user, i) => (
              <CSSTransition key={`user-${i}`} classNames="itemfade" timeout={500}>
                <div
                  key={user.userId}
                  className={`px-[10px] py-[8px] md:text-lg text-base text-center rounded-[5px] text-white font-bold md:py-[12px] px-[10px] ${
                    authUser.id === user.userId ? "bg-primary" : "bg-secondaryDarken"
                  }`}
                >
                  {user.nickname}
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>

        {isFetchUsersLoading && spinLoaderMin()}
        <div ref={scrollTriggerRef} className="h-[20px]" />
      </div>
    </LobbyUserCss>
  );
};

const LobbyUserCss = styled.div`
  .itemfade-enter {
    opacity: 0.01;
  }

  .itemfade-enter.itemfade-enter-active {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }

  .itemfade-leave {
    opacity: 1;
  }

  .itemfade-leave.itemfade-leave-active {
    opacity: 0.01;
    transition: opacity 500ms ease-in;
  }
`;
