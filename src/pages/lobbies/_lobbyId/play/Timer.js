import React, { useGlobal, useState } from "reactn";
import { useRouter } from "next/router";

export const Timer = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  const secondsLeft = props.secondsLeft ?? 20;
  const secondsLeftPercentage = Math.round(((secondsLeft) / 30) * 100);
  const totalSeconds = (props.totalSeconds ?? 30) * 2 * Math.PI;

  return (
    <div>
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center overflow-hidden rounded-full"
        >
          <svg className="w-40 h-40">
            <circle
              className="text-gray-300"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
            />
            <circle
              className="text-blue-600"
              strokeWidth="12"
              strokeDasharray={totalSeconds}
              strokeDashoffset={totalSeconds - secondsLeftPercentage / 100 * totalSeconds}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
            />
          </svg>
          <div className="absolute text-whiteLight">
            <span className="text-4xl">{secondsLeft}</span>
            <div>segundos</div>

          </div>
        </div>
      </div>
    </div>
  );
}
