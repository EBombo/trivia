import React, { useGlobal, useState, useEffect, useMemo } from "reactn";
import { useRouter } from "next/router";
import { Tablet, Desktop } from "../../../../constants";

export const Timer = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const [totalSeconds, setTotalSeconds] = useState(props.totalSeconds ?? 40);

  // const totalSecondsInRad = useMemo(
  //   () => ((totalSeconds ?? 40) * 2 * Math.PI),
  //   [totalSeconds]);

  const [secondsLeft, setSecondsLeft] = useState(props.secondsLeft ?? 20);

  const [secondsLeftPercentage, setSecondsLeftPercentage] = useState(0);
  
  useEffect(() => {
    setSecondsLeftPercentage(
      Math.round(((secondsLeft) / totalSeconds) * 100)
    );
  }, [secondsLeft]);

  return (
    <div>
      <div className="text-center font-bold flex flex-row md:flex-col items-center">
        <div
          className="inline-flex items-center justify-center overflow-hidden rounded-full"
        >
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
                strokeDashoffset={totalSeconds - secondsLeftPercentage / 100 * totalSeconds}
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
                strokeDashoffset={totalSeconds - secondsLeftPercentage / 100 * totalSeconds}
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
}
