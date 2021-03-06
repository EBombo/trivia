import React from "reactn";
import { config } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";
import { useTranslation } from "../../../../hooks";

export const QuestionStep = (props) => {
  const { t } = useTranslation();

  return (
    <div className={`absolute top-[-1px] left-0 z-10`}>
      <Image className="absolute top-0 left-0" src={`${config.storageUrl}/resources/purple-bg-question-step.svg`} />
      <div className="relative font-bold text-whiteLight text-lg pl-2 pr-10">
        {props.question.questionNumber} {t("of-step")} {props.lobby.gameQuestions?.length}
      </div>
    </div>
  );
};
