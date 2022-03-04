import React, { useGlobal, useState, useEffect, useMemo } from "reactn";
import { Tablet, Desktop } from "../../../../constants";
import { useInterval } from "../../../../hooks/useInterval";
import { ANSWERING_QUESTION, QUESTION_TIMEOUT } from "../../../../components/common/DataList";

export const Timer = (props) => {
  const [authUser] = useGlobal("user");

  const totalSeconds = useMemo(() => {
    if (typeof props.time === "number") return props.time;
    else if (typeof props.time === "string") return parseInt(props.time);
    return null;
  }, [props.time]);

  const [secondsLeft, setSecondsLeft] = useState(props.lobby.game.secondsLeft ?? totalSeconds);

  const [secondsLeftPercentage, setSecondsLeftPercentage] = useState(0);

  useInterval(() => {
    if (secondsLeft === null) return null;

    // only admin has control over timer
    if (!authUser.isAdmin) return;

    if (props.lobby.game.state === QUESTION_TIMEOUT) return null;

    if (secondsLeft <= 0 && props.lobby.game.state === ANSWERING_QUESTION)
      return props.onUpdateGame?.({ state: QUESTION_TIMEOUT });

    // setSecondsLeft(secondsLeft - 1);
  }, 1000);

  useEffect(() => {
    setSecondsLeftPercentage(Math.round((secondsLeft / totalSeconds) * 100));

    props.onUpdateGame?.({ secondsLeft: secondsLeft });
  }, [secondsLeft]);

  return (
    <div>
      <div className="text-center font-bold flex flex-row md:flex-col items-center">
        <div className="inline-flex items-center justify-center overflow-hidden rounded-full">
          <Desktop>
            <svg className="w-40 h-40">
              <circle
                className="text-secondaryDarken"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="60"
                cx="80"
                cy="80"
              />
              <circle
                className="text-success origin-center scale-x-[-1] rotate-90 transition-all ease-out duration-500"
                strokeWidth="12"
                strokeDasharray={totalSeconds}
                strokeDashoffset={totalSeconds - (secondsLeftPercentage / 100) * totalSeconds}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                pathLength={totalSeconds}
                r="60"
                cx="80"
                cy="80"
              />
            </svg>
          </Desktop>
          <Tablet>
            <svg className="w-20 h-20 mx-4">
              <circle
                className="text-secondaryDarken"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="30"
                cx="50%"
                cy="50%"
              />
              <circle
                className="text-success origin-center  transition-all ease-out duration-500"
                strokeWidth="8"
                strokeDasharray={totalSeconds}
                strokeDashoffset={totalSeconds - (secondsLeftPercentage / 100) * totalSeconds}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                pathLength={totalSeconds}
                r="30"
                cx="50%"
                cy="50%"
              />
            </svg>
          </Tablet>

          <div className="absolute text-whiteLight">
            <span className="text-2xl md:text-4xl">{secondsLeft}</span>
            <div className="text-xs md:text-base hidden md:block">segundos</div>
          </div>
        </div>
        <div className="text-left hidden md:block">{props.label ?? ""}</div>
      </div>
    </div>
  );
};
