import React, { useMemo } from "reactn";
import { Image } from "../../../../components/common/Image";
import { config } from "../../../../firebase";

export const OpenAnswerCellResult = (props) => {

  return (
    <div className={`relative ${props.isCorrect ? "bg-inGameGreen" : "bg-inGameRed" } font-bold text-whiteLight text-lg rounded py-2`}>
      <div
        className={`absolute top-[-12px] left-[94%] ${props.isCorrect ? "bg-inGameGreenDark" : "bg-inGameRedDark" } rounded-[50%] shadow w-[30px]`}
      >{props.count ?? 0}</div>
      {props.answer}
    </div>);
};
