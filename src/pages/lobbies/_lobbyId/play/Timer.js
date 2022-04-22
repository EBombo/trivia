import React, { useGlobal, useState, useEffect, useMemo } from "reactn";
import { Tablet, Desktop } from "../../../../constants";
import { useInterval } from "../../../../hooks/useInterval";
import { useTranslation } from "../../../../hooks";
import { ANSWERING_QUESTION, QUESTION_TIMEOUT } from "../../../../components/common/DataList";

export const Timer = (props) => {

  const { t } = useTranslation();

  const [authUser] = useGlobal("user");

  const totalSeconds = useMemo(() => {
    if (typeof props.time === "number") return props.time;

    if (typeof props.time === "string") return parseInt(props.time);

    return null;
  }, [props.time]);

  const [secondsLeft, setSecondsLeft] = useState(props.lobby.game.secondsLeft ?? totalSeconds);

  const secondsLeftPercentage = useMemo(() => {
    return Math.round(((props.lobby.game.secondsLeft ?? 0) / totalSeconds) * 100);
  }, [props.lobby.game.secondsLeft, totalSeconds]);

  useEffect(() => {
    if (!authUser.isAdmin) return;

    props.onUpdateGame?.({ secondsLeft: secondsLeft });
  }, [secondsLeft]);

  useInterval(() => {
    if (secondsLeft === null) return null;

    // only admin has control over timer
    if (!authUser.isAdmin) return;

    if (props.lobby.game.state === QUESTION_TIMEOUT) return null;

    if (secondsLeft <= 0 && props.lobby.game.state === ANSWERING_QUESTION)
      return props.onUpdateGame?.({ state: QUESTION_TIMEOUT });

    setSecondsLeft(secondsLeft - 1);
  }, 1000);

  return (
    <div>
      <div className="text-center font-bold flex flex-row md:flex-col items-center">
        <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full">
          <Desktop>
            <svg className="w-[120px] h-[120px]">
              <circle
                className="text-secondaryDarken"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="60"
                cy="60"
              />
              <circle
                className="text-success origin-center scale-x-[-1] rotate-90 transition-all ease-out duration-500"
                strokeWidth="8"
                strokeDasharray={totalSeconds}
                strokeDashoffset={totalSeconds - (secondsLeftPercentage / 100) * totalSeconds}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                pathLength={totalSeconds}
                r="45"
                cx="60"
                cy="60"
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
                className="text-success origin-center scale-x-[-1] rotate-90 transition-all ease-out duration-500"
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
            <span className="text-2xl md:text-3xl">
              {authUser.isAdmin ? secondsLeft : props.lobby.game.secondsLeft}
            </span>
            <div className="text-xs md:text-sm hidden md:block">{t("pages.lobby.in-play.seconds")}</div>
          </div>
        </div>
        <div className="text-left hidden md:block">{props.label ?? ""}</div>
      </div>
    </div>
  );
};
