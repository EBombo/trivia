import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { timeoutPromise } from "../../../../utils/promised";
import { Desktop, mediaQuery, Tablet } from "../../../../constants";
import { Winner } from "./Winner";
import { ButtonAnt } from "../../../../components/form";
import {
  fadeInLeftBig,
  fadeInRightBig,
  fadeInUp,
  fadeOutLeftBig,
  fadeOutRightBig,
  fadeOutUpBig,
} from "react-animations";
import { config, firestore } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";
import { snapshotToArray } from "../../../../utils";
import { useTranslation } from "../../../../hooks";

export const LobbyClosed = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const { t } = useTranslation();

  const [authUser] = useGlobal("user");

  const [isVisibleTitle, setIsVisibleTitle] = useState(true);
  const [isVisibleTitleAnimation, setIsVisibleTitleAnimation] = useState(false);

  const [showResume, setShowResume] = useState(false);
  const [showResumeAnimation, setShowResumeAnimation] = useState(false);

  const [showWinners, setShowWinners] = useState(false);
  const [showWinnersAnimation, setShowWinnersAnimation] = useState(false);

  const [correctAnswersPercentage, setCorrectAnswersPercentage] = useState(0);

  const [rankingUsers, setRankingUsers] = useState([]);

  const [users, setUsers] = useState([]);

  // Fetch users.
  useEffect(() => {
    if (!props.lobby || !props.game) return;

    const fetchUsers = () =>
      firestore
        .collection("lobbies")
        .doc(lobbyId)
        .collection("users")
        .onSnapshot((usersRef) => {
          const users_ = snapshotToArray(usersRef);
          setUsers(users_);
        });

    const unSubUsers = fetchUsers();
    return () => unSubUsers && unSubUsers();
  }, []);

  useEffect(() => {
    const initializeAnimation = async () => {
      await timeoutPromise(2 * 1000);
      setIsVisibleTitleAnimation(true);
      await timeoutPromise(2 * 1000);
      setIsVisibleTitle(false);
    };

    const fetchCorrectAnswers = async () => {
      const answersSnapshot = await firestore.collection(`lobbies/${lobbyId}/answers`).get();

      const correctAnswersRatio = answersSnapshot.docs.reduce(
        (acc, answerSnapshot) => {
          const answer = answerSnapshot.data();

          acc.total += 1;
          if (answer.points !== 0) acc.correct += 1;

          return acc;
        },
        { total: 0, correct: 0 }
      );

      const correctAnswersPercentage_ = Math.ceil((correctAnswersRatio.correct / correctAnswersRatio.total) * 100);

      setCorrectAnswersPercentage(correctAnswersPercentage_);
    };

    fetchCorrectAnswers();

    initializeAnimation();
  }, []);

  useEffect(() => {
    const fetchRanking = async () => {
      const rankingSnapshot = await firestore.collection(`lobbies/${lobbyId}/ranking`).orderBy("rank", "asc").get();

      const ranking = snapshotToArray(rankingSnapshot);

      setRankingUsers(ranking);
    };

    fetchRanking();
  }, []);

  const initializeTransitionToResume = async () => {
    setShowResumeAnimation(true);
    await timeoutPromise(1000);
    setShowResume(true);
    setShowResumeAnimation(false);
  };

  const initializeTransitionToWinners = async () => {
    setShowResumeAnimation(true);
    await timeoutPromise(1000);
    setShowResume(false);
    setShowResumeAnimation(false);
  };

  const initializeTransitionToListWinners = async () => {
    setShowWinnersAnimation(true);
    await timeoutPromise(1000);
    setShowWinners(true);
    setShowWinnersAnimation(false);
  };

  // gets size of first three players in ranking. if there are lower than that,
  // then takes all of them
  const winnersSize = useMemo(() => rankingUsers.slice(0, 3)?.length ?? 0, [rankingUsers]);

  const itemAttendees = useMemo(
    () => (
      <div className="item flex">
        <div className="grid grid-cols-[1fr_2fr] w-full">
          <Image src={`${config.storageUrl}/resources/attendees.png`} width="55px" desktopWidth="75px" />
          <div className="self-center justify-self-start">
            <div className="text-3xl md:text-4xl text-left">{users.length}</div>
            <div className="text-xl md:text-3xl">{t("pages.lobby.closed.assistants")}</div>
          </div>
        </div>
      </div>
    ),
    [users]
  );

  const itemPlayAgain = useMemo(
    () => (
      <div className="item flex">
        <div className="content-center text-lg md:text-3xl">
          <span className="inline-block mb-4">{t("pages.lobby.closed.play-again-label")}</span>
          <ButtonAnt
            variant="contained"
            color="success"
            margin="auto"
            className="font-bold text-xl"
            size="big"
            onClick={() => {
              const userId = authUser.id;
              const redirectUrl = `${window.location.origin}/trivia/lobbies/new?gameId=${props.lobby.game.id}&userId=${userId}`;
              window.open(redirectUrl, "_blank");
            }}
          >
            {t("pages.lobby.closed.play-again-button-label")}
          </ButtonAnt>
        </div>
      </div>
    ),
    [authUser.id]
  );

  const itemMessages = useMemo(
    () => (
      <div className="item flex">
        <div className="grid grid-cols-[1fr_2fr] w-full">
          <div className=" w-[120px] h-[120px] rounded-[50%] md:leading-[7rem] self-center justify-self-center bg-success whitespace-nowrap text-xl md:text-4xl text-secondaryDark">
            {correctAnswersPercentage} %
          </div>
          <div className="self-center justify-self-start">
            <div className="text-2xl md:text-4xl">{t("pages.lobby.closed.answers-label")}</div>
            <div className="text-lg md:text-3xl text-left">{t("pages.lobby.closed.correct-label")}</div>
          </div>
        </div>
      </div>
    ),
    [correctAnswersPercentage]
  );

  const itemOptions = useMemo(
    () => (
      <div className="item">
        <ButtonAnt
          variant="contained"
          color="primary"
          margin="20px auto"
          width="80%"
          onClick={initializeTransitionToListWinners}
        >
          {t("pages.lobby.closed.see-full-report-button-label")}
        </ButtonAnt>
        <ButtonAnt
          variant="contained"
          color="primary"
          margin="20px auto"
          width="80%"
          onClick={initializeTransitionToWinners}
        >
          {t("pages.lobby.closed.go-back-button-label")}
        </ButtonAnt>
        <ButtonAnt
          variant="contained"
          color="primary"
          margin="20px auto"
          width="80%"
          onClick={() => props.onLogout?.()}
        >
          {t("pages.lobby.closed.log-out-button-label")}
        </ButtonAnt>
      </div>
    ),
    []
  );

  if (showWinners)
    return (
      <LobbyWinnersCss>
        <div className="anchor-link" onClick={() => setShowWinners(false)}>
          {t("pages.lobby.closed.go-back-to-podium-button-label")}
        </div>
        <div className="list">
          {props.lobby.winners?.map((winner, index) => (
            <Winner winner={winner} index={index} key={index} isList />
          ))}
          {rankingUsers.slice(props.lobby.winners.length)?.map((winner, index) => (
            <Winner winner={winner} index={index} key={index} isList />
          ))}
        </div>
      </LobbyWinnersCss>
    );

  return showResume ? (
    <LobbyResumeCss
      showResumeAnimation={showResumeAnimation}
      showWinnersAnimation={showWinnersAnimation}
      className="bg-secondary bg-center bg-contain bg-lobby-pattern flex min-h-screen"
    >
      <div className="resume w-full md:w-auto">
        <div className="item">
          <Image
            src={`${config.storageUrl}/resources/coap.png`}
            desktopHeight="80%"
            height="200px"
            margin="-15% auto 15px auto"
            size="contain"
          />
          <ButtonAnt
            variant="contained"
            color="primary"
            margin="auto auto 15px auto"
            onClick={initializeTransitionToWinners}
          >
          {t("pages.lobby.closed.go-back-to-podium-button-label")}
          </ButtonAnt>
        </div>
        <div className="child">
          <Desktop>
            {itemAttendees}
            {itemPlayAgain}
            {itemMessages}
            {itemOptions}
          </Desktop>
          <Tablet>
            <div className="metric-child">
              {itemAttendees}
              {itemMessages}
            </div>
            {itemPlayAgain}
            {itemOptions}
          </Tablet>
        </div>
      </div>
    </LobbyResumeCss>
  ) : (
    <LobbyClosedCss
      isVisibleTitleAnimation={isVisibleTitleAnimation}
      showResumeAnimation={showResumeAnimation}
      showWinnersAnimation={showWinnersAnimation}
      className="bg-secondary bg-lobby-pattern"
    >
      <div className="header">
        {!isVisibleTitle && (
          <ButtonAnt variant="primary" margin="10px 10px auto auto" onClick={initializeTransitionToResume}>
            {t("pages.lobby.closed.go-back-to-podium-button-label")}
          </ButtonAnt>
        )}
      </div>

      {isVisibleTitle && <div className="title">{props.lobby.game.name}</div>}

      {!isVisibleTitle && (
        <div className="winners">
          {rankingUsers.slice(0, 3)?.map((winner, index) => (
            <Winner
              winner={winner}
              index={index}
              key={index}
              enableAnimation
              animationDelay={winnersSize - 1 - index}
            />
          ))}
        </div>
      )}

      {!isVisibleTitle && (
        <div className="footer">
          <div className="anchor-link" onClick={initializeTransitionToListWinners}>
            {t("pages.lobby.closed.see-all-positions-label")}
          </div>
        </div>
      )}
    </LobbyClosedCss>
  );
};

const fadeInUpAnimation = keyframes`${fadeInUp}`;
const fadeInRightBigAnimation = keyframes`${fadeInRightBig}`;
const fadeInLeftBigAnimation = keyframes`${fadeInLeftBig}`;

const fadeOutUpBigAnimation = keyframes`${fadeOutUpBig}`;
const fadeOutLeftBigAnimation = keyframes`${fadeOutLeftBig}`;
const fadeOutRightBigAnimation = keyframes`${fadeOutRightBig}`;

const LobbyClosedCss = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr 6fr 1fr;

  .header {
    display: flex;
  }

  .title {
    margin: auto;
    background: ${(props) => props.theme.basic.white};
    font-size: 1.5rem;
    padding: 10px 10px;
    border-radius: 5px;
    animation: 2s ${(props) => (props.isVisibleTitleAnimation ? fadeOutUpBigAnimation : "")};
  }

  .winners {
    width: 90%;
    margin: auto;

    ${mediaQuery.afterTablet} {
      width: 70vw;
    }
  }

  .footer {
    display: flex;
    animation: 2s ${fadeInUpAnimation};

    .anchor-link {
      margin: auto;
      cursor: pointer;
      font-size: 2rem;
      font-weight: bold;
      color: ${(props) => props.theme.basic.white};
    }
  }
`;

const LobbyResumeCss = styled.div`
  text-align: center;
  font-weight: bold;

  .flex {
    display: flex;
  }

  .item {
    border-radius: 10px;
    background: ${(props) => props.theme.basic.white};

    .content-center {
      margin: auto;
    }
  }

  .resume {
    margin: 50px 15px;
    display: grid;
    grid-gap: 20px;
    animation: 1s ${(props) => (props.showResumeAnimation ? fadeOutRightBigAnimation : fadeInRightBigAnimation)};

    ${mediaQuery.afterTablet} {
      width: 70%;
      height: 300px;
      margin: auto;
      grid-template-columns: 1.5fr 3fr;
    }

    .child {
      display: grid;
      grid-gap: 20px;
      grid-template-rows: 1fr 1fr 1.3fr;

      .metric-child {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr 1fr;
      }

      ${mediaQuery.afterTablet} {
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1.3fr 1fr;
      }

      .metric {
        margin: auto 5%;
        display: grid;
        text-align: left;
        grid-template-columns: 1.5fr 1fr;
        color: ${(props) => props.theme.basic.secondary};

        .number {
          font-size: 1.7rem;
        }

        .label {
          font-size: 1rem;
        }
      }
    }
  }
`;

const LobbyWinnersCss = styled.div`
  display: flex;
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr 6fr;
  background: ${(props) => props.theme.basic.secondary};

  .list {
    width: 90%;
    margin: auto;
    animation: 2s ${(props) => (props.showResumeAnimation ? fadeOutLeftBigAnimation : fadeInLeftBigAnimation)};

    ${mediaQuery.afterTablet} {
      width: 70vw;
    }
  }

  .anchor-link {
    margin: auto;
    cursor: pointer;
    font-size: 2rem;
    font-weight: bold;
    color: ${(props) => props.theme.basic.white};
  }
`;
