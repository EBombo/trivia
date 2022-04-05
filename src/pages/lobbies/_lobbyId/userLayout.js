import React, { useGlobal, useState } from "reactn";
import styled from "styled-components";
import { Popover, Slider, Spin, Tooltip } from "antd";
import { mediaQuery, Desktop } from "../../../constants";
import { config, firestore, firestoreBomboGames, hostName } from "../../../firebase";
import { Image } from "../../../components/common/Image";
import { LoadingOutlined, MessageOutlined } from "@ant-design/icons";
import { ButtonAnt } from "../../../components/form";

export const UserLayout = (props) => {
  const [authUser] = useGlobal("user");
  const [audios] = useGlobal("audios");

  const [volume, setVolume] = useState(30);
  const [isPlay, setIsPlay] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingLock, setIsLoadingLock] = useState(false);

  const updateLobby = async () => {
    const promiseBingo = firestore.collection("lobbies").doc(props.lobby.id).update({
      isLocked: !props.lobby.isLocked,
    });

    const promiseEbombogames = firestoreBomboGames.collection("lobbies").doc(props.lobby.id).update({
      isLocked: !props.lobby.isLocked,
    });

    await Promise.all([promiseBingo, promiseEbombogames]);
  };

  return (
    <UserLayoutCss>
      <div className="left-content">
        {authUser?.isAdmin && (
          <div className="left-container">
            {props.musicPickerSetting && (
              <Popover
                trigger="click"
                content={
                  <AudioStyled>
                    {audios.map((audio_) => (
                      <div
                        key={audio_.id}
                        className="item-audio"
                        onClick={() => {
                          if (props.audioRef.current) props.audioRef.current.pause();

                          const currentAudio = new Audio(audio_.audioUrl);

                          props.audioRef.current = currentAudio;
                          props.audioRef.current.volume = volume / 100;
                          props.audioRef.current.play();
                          setIsPlay(true);
                        }}
                      >
                        {audio_.title}
                      </div>
                    ))}
                  </AudioStyled>
                }
              >
                <button className="nav-button" key={props.audioRef.current?.paused}>
                  {isPlay ? (
                    <Image
                      cursor="pointer"
                      src={`${config.storageUrl}/resources/sound.svg`}
                      height="25px"
                      width="25px"
                      size="contain"
                      margin="auto"
                    />
                  ) : (
                    "►"
                  )}
                </button>
              </Popover>
            )}

            {props.volumeSetting && (
              <Popover
                content={
                  <SliderContent>
                    <Slider
                      value={volume}
                      defaultValue={30}
                      onChange={(value) => {
                        if (!props.audioRef.current) return;

                        props.audioRef.current.volume = value / 100;
                        setVolume(value);
                      }}
                    />
                  </SliderContent>
                }
              >
                <button
                  className="nav-button"
                  disabled={!isPlay}
                  onClick={() => {
                    if (!props.audioRef.current) return;

                    if (props.audioRef.current.volume === 0) {
                      props.audioRef.current.volume = 30 / 100;
                      setVolume(30);

                      return setIsMuted(false);
                    }
                    setVolume(0);
                    props.audioRef.current.volume = 0;
                    setIsMuted(true);
                  }}
                  key={isMuted}
                >
                  <Image
                    cursor="pointer"
                    src={
                      isMuted ? `${config.storageUrl}/resources/mute.svg` : `${config.storageUrl}/resources/volume.svg`
                    }
                    height="25px"
                    width="25px"
                    size="contain"
                    margin="auto"
                  />
                </button>
              </Popover>
            )}

            {props.lockSetting && (
              <button
                disabled={isLoadingLock}
                onClick={async () => {
                  setIsLoadingLock(true);
                  await updateLobby();
                  setIsLoadingLock(false);
                }}
              >
                {isLoadingLock ? (
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                ) : (
                  <Image
                    src={`${config.storageUrl}/resources/${props.lobby.isLocked ? "lock.svg" : "un-lock.svg"}`}
                    cursor="pointer"
                    height="25px"
                    width="25px"
                    size="contain"
                    margin="auto"
                  />
                )}
              </button>
            )}
          </div>
        )}
        <div className="title no-wrap">
          <Tooltip placement="bottom" title="Click aquí para copiar el link de ebombo con pin">
            <div
              className="label"
              onClick={() => {
                navigator.clipboard.writeText(`${hostName}/?pin=${props.lobby?.pin}`);
                props.showNotification("OK", "Link copiado!", "success");
              }}
            >
              {props.lobby.isLocked ? (
                "Este juego esta bloqueado"
              ) : (
                <>
                  <span className="font-black">
                    {" "}
                    PIN:{props.lobby.pin}{" "}
                    <Image className="inline-block" src={`${config.storageUrl}/resources/link.svg`} width="18px" />
                  </span>
                </>
              )}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="text-xl font-black text-center text-ellipsis overflow-hidden whitespace-nowrap">
        {props.lobby.game.name}
      </div>
      <div className="right-content">
        {props.enableChat && (
          <Desktop>
            <ButtonAnt
              onClick={() => {
                props.setToggleChat((prevValue) => !prevValue);
              }}
            >
              <MessageOutlined /> Chat
            </ButtonAnt>
          </Desktop>
        )}

        {!authUser.isAdmin && (
          <Popover
            trigger="click"
            content={
              <div>
                <div
                  onClick={async () => {
                    props.logout();
                    await firestore
                      .collection("lobbies")
                      .doc(props.lobby.id)
                      .collection("users")
                      .doc(authUser.id)
                      .delete();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Salir
                </div>
              </div>
            }
          >
            <div className="icon-menu">
              <span />
              <span />
              <span />
            </div>
          </Popover>
        )}
      </div>
    </UserLayoutCss>
  );
};

const UserLayoutCss = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  background: ${(props) => props.theme.basic.whiteDark};
  padding: 0.5rem;
  height: 50px;

  .title {
    text-align: center;
    font-family: Lato;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 30px;
  }

  .left-content {
    display: flex;

    .title {
      margin: 0 16px;
    }
  }

  .left-container {
    button {
      margin: 0 8px;
    }
  }

  .right-content {
    display: flex;
    justify-content: flex-end;

    .icon-menu {
      cursor: pointer;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      flex-direction: column;
      height: 30px;

      span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: ${(props) => props.theme.basic.blackDarken};
      }
    }
  }

  .description {
    font-family: Lato;
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 14px;
  }

  .right-container {
    display: flex;
    align-items: center;

    button {
      width: 30px;
      height: 30px;
      border: none;
      background: ${(props) => props.theme.basic.whiteLight};

      border-radius: 50%;
      margin: 0 5px;
    }
  }

  ${mediaQuery.afterTablet} {
    padding: 0 1rem;

    .description {
      font-size: 18px;
      line-height: 22px;
    }

    .right-container {
      button {
        width: 40px;
        height: 40px;
        margin: 0 1rem;
      }
    }
  }
`;

const AudioStyled = styled.div`
  width: 100%;

  .item-audio {
    cursor: pointer;
    padding: 0 10px;

    &:hover {
      color: ${(props) => props.theme.basic.secondary};
      background: ${(props) => props.theme.basic.primaryLight};
    }
  }
`;

const SliderContent = styled.div`
  width: 100px;

  .ant-slider-track {
    background-color: ${(props) => props.theme.basic.success} !important;
  }

  .ant-slider-handle {
    border: solid 2px ${(props) => props.theme.basic.successDark} !important;
  }
`;
