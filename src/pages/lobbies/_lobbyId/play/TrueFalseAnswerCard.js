import React, { useGlobal, useState, useMemo } from "reactn";
import { config } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";

export const TrueFalseAnswerCard = (props) => {

  const iconUrl = useMemo(() =>
    (props.value === false
      ? `${config.storageUrl}/resources/cross.svg`
      : props.value === true
      ? `${config.storageUrl}/resources/check.svg`
      : ""
    ), 
    [props.color]);

  const colorClass = useMemo(() =>
    (props.value === false
      ? 'bg-inGameRed'
      : props.value === true
      ? 'bg-inGameBlue'
      : 'bg-primary'),
    [props.color]);

  return (
    <div className="relative mx-4 my-2 min-h-[70px] grid grid-cols-[min-content_auto] overflow-hidden rounded">
      <div className={`${colorClass} inline-block w-[70px] p-5`}>
        <Image src={iconUrl} />
      </div>
      <div className="bg-whiteLight flex justify-center">
        <div className="self-center bg-whiteLight font-bold text-secondaryDarken text-lg">
          {props.label ?? 'Alternativa'}
        </div>
      </div>
      <div className="absolute w-full bottom-0 left-0 min-h-[8px] bg-black opacity-20"></div>
    </div>
  );
};

