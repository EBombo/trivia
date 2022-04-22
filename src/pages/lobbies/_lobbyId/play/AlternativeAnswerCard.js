import React, { useMemo } from "reactn";
import { Image } from "../../../../components/common/Image";
import { getIconUrl } from "../../../../components/common/DataList";

export const AlternativeAnswerCard = (props) => {
  const iconUrl = useMemo(() => getIconUrl(props.color), [props.color]);

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
    <div
      className={`relative
      mx-4 my-2
      min-h-[70px] md:min-h-[80px]
      grid grid-cols-[min-content_auto] overflow-hidden rounded
      cursor-pointer
      ${props.enableOpacity && "opacity-20"}`}
      {...props}
    >
      <div className={`${colorClass} inline-block w-[70px] p-5`}>
        <Image src={iconUrl} />
      </div>

      <div className="bg-whiteLight flex justify-center">
        <div className="self-center font-bold text-secondaryDarken text-lg md:text-2xl">
          {props.label ?? "-"}
        </div>
      </div>

      <div className="absolute w-full bottom-0 left-0 min-h-[8px] bg-black opacity-20" />
    </div>
  );
};
