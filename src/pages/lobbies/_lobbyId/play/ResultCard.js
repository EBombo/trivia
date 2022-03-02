import React from "reactn";
import { config, hostName } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";

export const ResultCard = (props) => (
  <div className="relative my-4 mx-4 pt-8 pb-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
    <div
      className={`absolute top-[-20px] left-1/2 translate-x-[-50%]
        ${props.correct ? "bg-success" : "bg-danger"} 
        ${props.correct ? "text-secondaryDarken" : "text-whiteLight"}
        rounded max-w-[250px] whitespace-nowrap px-8`}
    >
      <span className="inline-block py-4 pr-4 align-middle">
        {props.correct ? (
          <Image src={`${config.storageUrl}/resources/check-with-depth.svg`} width="16px" />
        ) : (
          <Image src={`${config.storageUrl}/resources/cross-with-depth.svg`} width="16px" />
        )}
      </span>
      {props.correct ? "Respuesta correcta" : "Respuesta incorrecta"}
    </div>

    {props.correct ? (
      <>
        <div className="text-secondaryDarken">
          <span className="inline-block py-4 align-middle">
            <Image src={`${config.storageUrl}/resources/red-fire-streak.svg`} width="12px" />
          </span>
          Racha de respuestas: 8
        </div>
        <div className="text-black text-3xl py-8">+600 puntos</div>
      </>
    ) : (
      <div className="text-secondaryDarken">¡Hay que mantener la cabeza en el juego!</div>
    )}

    <div className="text-black">Puntaje actual: 1500 pts</div>
    <div className="text-black">Puesto: 25/200</div>
  </div>
);
