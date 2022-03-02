import React, { useEffect, useGlobal, useRef, useState } from "reactn";
import { config, firestore } from "../../../firebase";
import { timeoutPromise } from "../../../utils/promised";

export const LobbyLoading = (props) => {
  const [authUser] = useGlobal("user");

  // awaits for 10 seconds then go to the game
  useEffect(() => {
    const updateLobby = async () => {
      await timeoutPromise(10000);

      await firestore.doc(`lobbies/${props.lobby.id}`).update({
        isPlaying: true,
      });
    };

    updateLobby();
  }, []);

  return (
    <div>
      {authUser.isAdmin ? (
        <>
          <div className="step-one">
            <Image
              src={`${config.storageUrl}/resources/white-icon-ebombo.png`}
              height="58px"
              width="222px"
              desktopHeight="92px"
              desktopWidth="350px"
              size="contain"
              margin="0 auto"
              className="step-one-logo"
            />
            <div className="step-one-description">Entra a ebombo.io</div>
          </div>
          <div className="step-two">
            <div className="step-two-name">{get(props, "lobby.game.name", "")}</div>
          </div>
          <div className="step-three">
            <div className="main-container">
              <div className="page">
                <div className="number">
                  <span className="num3">3</span>
                  <span className="num2">2</span>
                  <span className="num1">1</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="step-one-tablet">
            <div className="step-one-tablet-title">¡Prepárate!</div>

            <Image
              src={`${config.storageUrl}/resources/white_spinner.gif`}
              height="75px"
              width="75px"
              size="contain"
              margin="1rem auto"
            />
          </div>
        </>
      )}
    </div>
  );
};
