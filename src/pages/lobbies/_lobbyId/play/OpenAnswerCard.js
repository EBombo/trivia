import React, { useGlobal, useState, useMemo } from "reactn";
import { config } from "../../../../firebase";
import { Input, ButtonAnt } from "../../../../components/form";
import { Image } from "../../../../components/common/Image";

export const OpenAnswerCard = (props) => {
  return (
    <div className="relative flex flex-col justify-center">
      <div className={`mx-5 py-5 relative`}>
        <Input className="font-bold text-lg md:text-2xl" fontSize="18px" fontSizeDesktop="24px" height="56px" />
        {props.isAnswered && (
          <Image
            className="absolute top-0 right-2"
            src={`${config.storageUrl}/resources/check_black.svg`}
            width="36px"
          />
        )}
      </div>
      <div className="self-center">
        <ButtonAnt color="success" size="big" disabled={props.isAnswered}>
          <span className="font-bold text-lg px-4">Enviar</span>
        </ButtonAnt>
      </div>
    </div>
  );
};
