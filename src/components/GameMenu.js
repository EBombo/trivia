import React, { useState, useEffect } from "reactn";
import styled from "styled-components";
import { Collapse } from "antd";
import { ButtonAnt, Select, Switch, Input } from "./form";
import { languages } from "./common/DataList";
import defaultTo from "lodash/defaultTo";
import { config, firestore } from "../firebase";
import { Image } from "./common/Image";
import { useTranslation } from "../hooks";

const { Panel } = Collapse;

export const GameMenu = (props) => {

  const { t } = useTranslation();

  const [awards, setAwards] = useState([
    {
      name: "",
      order: 1,
    },
  ]);
  const [showAwards, setShowAwards] = useState(true);

  const [userIdentity, setUserIdentity] = useState(false);

  useEffect(() => {
    if (!showAwards) return props.onAwards?.([]);

    props.onAwards?.(awards);
  }, [showAwards, awards]);

  useEffect(() => {
    props.onUserIdentity?.(userIdentity);
  }, [userIdentity]);

  return (
    <GameCss className="w-full m-auto max-w-[500px] p-4 text-white md: p-[20px]">
      <div>
        <div className="border-none w-full m-auto text-[14px] font-bold font-['Lato'] text-center rounded-[4px] p-[10px] text-black bg-whiteDark shadow-[grayLighten]">
          {props.game.name}
        </div>

        {props.showChooseGameMode && (
          <div className="grid grid-cols-1	gap-[5px] p-[5px] pt-[10px]">
            <div className="font-['Lato'] p-[15px] text-[15px] font-bold leading-8 rounded-[4px] items-center bg-primary">
              <div className="w-full text-center">{t("pages.lobby.game-settings.players-vs-players")}</div>
              <div className="w-full text-center mb-2">{t("pages.lobby.game-settings.one-one-devices")}</div>
              <ButtonAnt
                className="font-bold"
                color="success"
                margin="auto"
                loading={props.isLoadingSave}
                disabled={props.isLoadingSave}
                onClick={() => props.createLobby("individual")}
              >
                {t("pages.lobby.game-settings.classic-button-label")}
              </ButtonAnt>
            </div>
          </div>
        )}

        <Collapse defaultActiveKey={["1"]} accordion className="border-none">
          <Panel header={t("pages.lobby.game-settings.options-game-title")} key="1">
            <div className="options">
              <div className="mb-3 py-3 text-center font-bold bg-whiteLight rounded-[2px] shadow-[0px_4px_0px_rgb(196,196,196)]">
                {t("pages.lobby.game-settings.recommended")}
              </div>

              <div className="grid grid-cols-[6fr_2fr] items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight">
                <div>
                  <div className="font-bold">{t("pages.lobby.game-settings.identify-players-label")}</div>
                  <span>{t("pages.lobby.game-settings.identify-players-description")}</span>
                </div>
                <div className="justify-self-end mt-4">
                  <Switch defaultChecked={userIdentity} onChange={() => setUserIdentity(!userIdentity)} />
                </div>
              </div>

              <div className="mt-3 mb-3 py-3 text-center font-bold bg-whiteLight rounded-[2px] shadow-[0px_4px_0px_rgb(196,196,196)]">
                {t("pages.lobby.game-settings.general")}
              </div>

              <div className="grid grid-cols-[5fr_3fr] items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight">
                <div>
                  <div className="font-bold">{t("pages.lobby.game-settings.language")}</div>
                </div>
                <Select
                  defaultValue={props.settings?.language ?? languages[0].name}
                  key={props.settings?.language ?? languages[0]}
                  optionsdom={languages.map((language) => ({
                    key: language.key,
                    code: language.value,
                    name: language.name,
                  }))}
                  onChange={(value) => props.onLanguageChange?.(value)}
                />
              </div>

              <div className="grid grid-cols-[5fr_3fr] items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight">
                <div>
                  <div className="font-bold">{t("pages.lobby.game-settings.lobby-music-title")}</div>
                </div>
                <Select
                  defaultValue={props.game?.audio?.id ?? props.audios[0]?.id}
                  key={props.game?.audio?.id ?? props.audios[0]?.id}
                  optionsdom={props.audios.map((audio) => ({
                    key: audio.id,
                    code: audio.id,
                    name: audio.title,
                  }))}
                  onChange={(value) => props.onAudioChange?.(value)}
                />
              </div>

              <div className="grid grid-cols-[5fr_3fr] items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight">
                <div>
                  <div className="font-bold">{t("pages.lobby.game-settings.prize")}</div>
                </div>
                <div className="justify-self-end mt-4">
                  <Switch defaultChecked={showAwards} onChange={() => setShowAwards(!showAwards)} />
                </div>
              </div>

              {showAwards && (
                <div
                  id={awards.length}
                  className="grid items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight"
                >
                  {defaultTo(awards, []).map((award, index) => (
                    <div className="relative my-1" key={`award-${index}`}>
                      <Input
                        type="text"
                        name={`award-${index}`}
                        defaultValue={award.name}
                        onBlur={(e) => {
                          let newAwards = awards;
                          newAwards[index].name = e.target.value;
                          setAwards([...newAwards]);
                        }}
                        placeholder={`Premio ${index + 1}`}
                        className={"dark"}
                        key={`award-${index}-${award.order}`}
                      />
                      <button
                        className="absolute top-1/2 right-0 translate-y-[-50%] px-2"
                        onClick={() => {
                          let newAwards = awards.filter((award, idx) => idx !== index);

                          setAwards([...newAwards]);
                        }}
                      >
                        <Image
                          src={`${config.storageUrl}/resources/close-white.svg`}
                          height="15px"
                          width="15px"
                          cursor="pointer"
                          size="contain"
                          margin="0"
                        />
                      </button>
                    </div>
                  ))}
                  <ButtonAnt
                    color="secondary"
                    margin="0.5rem 0 0.5rem auto"
                    onClick={() => {
                      setAwards([
                        ...awards,
                        {
                          name: "",
                          id: firestore.collection("awards").doc().id,
                          order: awards.length + 1,
                        },
                      ]);
                    }}
                  >
                    {t("pages.lobby.game-settings.add-button-label")}
                  </ButtonAnt>
                </div>
              )}
            </div>
          </Panel>
        </Collapse>
      </div>
    </GameCss>
  );
};

const GameCss = styled.div`
  .ant-collapse {
    .ant-collapse-item {
      border: none !important;
    }
  }

  .ant-collapse-header {
    font-size: 14px;
    font-weight: 700;
    font-family: Lato;
    text-align: center;
    border-radius: 4px !important;
    color: ${(props) => props.theme.basic.black};
    background: ${(props) => props.theme.basic.whiteDark};
    box-shadow: 0 4px 0 ${(props) => props.theme.basic.grayLighten};
    text-align: left;
    position: relative;

    .anticon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .ant-collapse-content {
    background: ${(props) => props.theme.basic.secondary} !important;
  }
`;
