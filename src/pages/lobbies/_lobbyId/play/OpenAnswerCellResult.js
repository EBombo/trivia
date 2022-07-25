import React from "reactn";

export const OpenAnswerCellResult = (props) => (
  <div
    className={`relative ${
      props.isBrainStorm ? "bg-white" : props.isCorrect ? "bg-inGameGreen" : "bg-inGameRed"
    } font-bold text-whiteLight text-lg rounded py-2 px-2`}
  >
    {props.isBrainStorm ? null : (
      <div
        className={`absolute top-[-12px] left-[94%] ${
          props.isCorrect ? "bg-inGameGreenDark" : "bg-inGameRedDark"
        } rounded-[50%] shadow w-[30px]`}
      >
        {props.count ?? 0}
      </div>
    )}
    <p
      className={`text-ellipsis overflow-hidden whitespace-nowrap text-base ${props.isBrainStorm ? "text-black" : ""}`}
    >
      {props.answer}
    </p>
  </div>
);
