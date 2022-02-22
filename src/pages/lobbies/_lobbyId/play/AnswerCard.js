import React, { useGlobal, useState, useMemo } from "reactn";
import { config } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";

export const AnswerCard = (props) => {

  const iconUrl = useMemo(() =>
    ((props.color === "red")
      ? `${config.storageUrl}/resources/red-star.svg`
      : props.color === "blue"
      ? `${config.storageUrl}/resources/blue-square.svg`
      : props.color === "green"
      ? `${config.storageUrl}/resources/green-circle.svg`
      : props.color === "yellow"
      ? `${config.storageUrl}/resources/yellow-triangle.svg`
      : ""
    ), 
    [props.color]);

  const colorClass = useMemo(() =>
    (props.color === "red"
      ? 'bg-inGameRed'
      : props.color === "blue"
      ? 'bg-inGameBlue'
      : props.color === "green"
      ? 'bg-inGameGreen'
      : props.color === "yellow"
      ? 'bg-inGameYellow' 
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
