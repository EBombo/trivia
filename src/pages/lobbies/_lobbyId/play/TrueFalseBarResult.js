import React, { useMemo } from "reactn";
import { Image } from "../../../../components/common/Image";
import { config } from "../../../../firebase";

export const TrueFalseBarResult = (props) => {
  const iconUrl = useMemo(
    () =>
      props.option === false
        ? `${config.storageUrl}/resources/cross.svg`
        : props.option === true
        ? `${config.storageUrl}/resources/check.svg`
        : "",
    [props.option]
  );

  const colorClass = useMemo(
    () => (props.option === false ? "bg-inGameRed" : props.option === true ? "bg-inGameBlue" : "bg-primary"),
    [props.option]
  );

  return (
    <div className="my-2 grid grid-cols-[min-content_auto] gap-2">
      <div className={`w-[50px] h-[50px] ${colorClass} rounded`}>
        <Image src={iconUrl} width="24px" />
      </div>
      <div className={`relative h-[50px] ${colorClass} rounded`} style={{ width: `${props.value ?? 1}%` }}>
        {props.isCorrect && (
          <div className="absolute right-4 top-4 pl-2 text-2xl font-bold">
            <Image src={`${config.storageUrl}/resources/check.svg`} width="24px" />
          </div>
        )}
        <div className="absolute left-[100%] top-2 pl-2 text-2xl font-bold">{props.count}</div>
      </div>
    </div>
  );
};
