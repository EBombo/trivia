import React, { useMemo } from "reactn";
import { config } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";
import { useTranslation } from "../../../../hooks";

export const TrueFalseAnswerCard = (props) => {
  const { t } = useTranslation();

  const iconUrl = useMemo(
    () =>
      props.value === false
        ? `${config.storageUrl}/resources/cross.svg`
        : props.value === true
        ? `${config.storageUrl}/resources/check.svg`
        : "",
    [props.color]
  );

  const colorClass = useMemo(
    () => (props.value === false ? "bg-inGameRed" : props.value === true ? "bg-inGameBlue" : "bg-primary"),
    [props.color]
  );

  return (
    <div
      className={`
      relative mx-4 my-2 min-h-[70px] md:min-h-[150px]
      grid ${
        props.value ? "grid-cols-[auto_min-content] md:grid-cols-[min-content_auto]" : "grid-cols-[auto_min-content]"
      }
      ${props.enableOpacity && "opacity-20"}
      cursor-pointer
      overflow-hidden rounded test-select-${props.index}`}
      {...props}
    >
      <div
        className={`inline-block w-[90px] p-7
        ${colorClass}
        ${props.value ? "col-start-2 col-end-3 md:col-start-1 md:col-end-2" : "col-start-2 col-end-3"}`}
      >
        <Image src={iconUrl} />
      </div>
      <div
        className={`bg-whiteLight flex justify-center
        ${
          props.value
            ? "row-start-1 col-start-1 col-end-2 md:col-start-2 md:col-end-3"
            : "row-start-1 col-start-1 col-end-2"
        }`}
      >
        <div className="self-center bg-whiteLight font-bold text-secondaryDarken text-lg md:text-2xl">
          {props.value ? t("pages.lobby.in-play.true") : t("pages.lobby.in-play.false")}
        </div>
      </div>
      <div className="absolute w-full bottom-0 left-0 min-h-[8px] bg-black opacity-20"></div>
    </div>
  );
};
