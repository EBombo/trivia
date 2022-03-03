import React from "reactn";
import { config } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";

export const QuestionStep = (props) => (
  <div className={`absolute top-0 left-0`}>
    <Image className="absolute top-0 left-0" src={`${config.storageUrl}/resources/purple-bg-question-step.svg`} />
    <div className="relative font-bold text-whiteLight text-lg pl-2 pr-10">10 de 30</div>
  </div>
);
