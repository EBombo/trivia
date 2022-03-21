import React from "reactn";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { config } from "../../../../firebase";
import { Input, ButtonAnt } from "../../../../components/form";
import { Image } from "../../../../components/common/Image";

export const OpenAnswerCard = (props) => {
  const schema = object().shape({
    answer: string().required(),
  });

  const { handleSubmit, register } = useForm({
    validationSchema: schema,
    reValidateMode: "onSubmit",
  });

  const submitAnswer = async (data) => {
    props.onSubmit?.(data.answer);
  };

  return (
    <div className="relative flex flex-col justify-center">
      <form onSubmit={handleSubmit(submitAnswer)}>
        <div className={`mx-5 py-5 relative`}>
          <Input
            className="font-bold text-lg md:text-2xl"
            fontSize="18px"
            fontSizeDesktop="24px"
            type="text"
            name="answer"
            ref={register}
            height="56px"
          />
          {props.isAnswered && (
            <Image
              className="absolute top-0 right-2"
              src={`${config.storageUrl}/resources/check-black.svg`}
              width="36px"
            />
          )}
        </div>
        <div className="self-center">
          <ButtonAnt htmlType="submit" color="success" size="big" disabled={props.isAnswered}>
            <span className="font-bold text-lg px-4">Enviar</span>
          </ButtonAnt>
        </div>
      </form>
    </div>
  );
};
