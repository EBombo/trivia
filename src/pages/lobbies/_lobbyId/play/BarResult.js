import React, { useMemo } from "reactn";
import { getIconUrl } from "../../../../components/common/DataList";
import { Image } from "../../../../components/common/Image";
import { config } from "../../../../firebase";

export const BarResult = (props) => {
  const colorClass = useMemo(
    () =>
      props.color === "red"
        ? "bg-inGameRed"
        : props.color === "blue"
        ? "bg-inGameBlue"
        : props.color === "green"
        ? "bg-inGameGreen"
        : props.color === "yellow"
        ? "bg-inGameYellow"
        : "bg-primary",
    [props.color]
  );

  return (
    <div className="my-2 grid grid-cols-[min-content_auto] gap-2">
      <div className={`w-[50px] h-[50px] ${colorClass} rounded`}>
        <Image src={getIconUrl(props.color)} width="24px" />
      </div>
      <div className={`relative h-[50px] ${colorClass} rounded`} style={{ width: `${props.value ?? 1}%` }}>
        {true && (
          <div className="absolute right-4 top-4 pl-2 text-2xl font-bold">
            <Image src={`${config.storageUrl}/resources/check.svg`} width="24px" />
          </div>
        )}
        <div className="absolute left-[100%] top-2 pl-2 text-2xl font-bold">{props.count}</div>
      </div>
    </div>
  );
};
