import React from "reactn";
import styled from "styled-components";
import {Collapse} from "antd";
import {ButtonAnt, Select} from "./form";
import {languages} from "./common/DataList";

const { Panel } = Collapse;

export const GameMenu = (props) => {
  return (
    <GameCss className="w-full m-auto max-w-[500px] p-4 text-white md: p-[20px]">
      <div>
        <div className="border-none w-full m-auto text-[14px] font-bold font-['Lato'] text-center rounded-[4px] p-[10px] text-black bg-whiteDark shadow-[grayLighten]">
          {props.game.name}
        </div>

        {props.showChooseGameMode && (
          <div className="grid grid-cols-1	gap-[5px] p-[5px] pt-[10px]">
            <div className="font-['Lato'] p-[15px] text-[15px] leading-8 rounded-[4px] items-center bg-primary">
              <div className="w-full text-center">Versión Simple</div>
              <div className="w-full text-center">La manera sencilla</div>
              <ButtonAnt
                className="font-bold"
                color="success"
                margin="auto"
                loading={props.isLoadingSave}
                disabled={props.isLoadingSave}
                onClick={() => props.createLobby("individual")}
              >
                Jugar
              </ButtonAnt>
            </div>
          </div>
        )}

        <Collapse defaultActiveKey={["1"]} accordion className="border-none">
          <Panel header="Opciones del juego" key="1">
            <div className="options">
              <div className="grid grid-cols-[5fr_3fr] items-center mx-auto my-[2px] px-[10px] py-[5px] text-[13px] leading-[16px] bg-primaryDarken rounded-[2px] text-whiteLight">
                <div>
                  <div className="font-bold">Idioma</div>
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
                  <div className="font-bold">Música en el Lobby</div>
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
