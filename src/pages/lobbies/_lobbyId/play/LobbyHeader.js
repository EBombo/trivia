import React, { useGlobal, useState } from "reactn";
import { useRouter } from "next/router";
import { Timer } from "./Timer";
import { QuestionStep } from "./QuestionStep";
import { ButtonAnt } from "../../../../components/form";

export const LobbyHeader = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  return (
    <div className="grid grid-rows-[minmax(160px,min-content)_auto]">
      <div className="relative bg-whiteLight py-4 text-center text-2xl md:text-3xl font-bold flex">
        <QuestionStep/>

        <div className="relative self-center w-full text-secondaryDarken">
          ¿Esta es una pregunta muy achorada muy achorada muy achorad muy achoradaa muy achoradaa  muy achoradaa muy achorada muy achorada muy achoradaaaa?
        </div>
      </div>
      <div className="grid grid-cols-[min-content_1fr] grid-rows-[auto auto] md:grid md:grid-cols-[1fr_3fr_1fr] md:grid-rows-1 text-whiteLight bg-secondaryDark bg-opacity-50 py-8">
        <div className={`text-center ${!props.lobby?.isAdmin && "self-center"}`}>
          { props.lobby?.isAdmin && (
            <div className="mb-8 hidden md:inline-block"><ButtonAnt color="default" size="big" className="font-bold">Invalidar pregunta</ButtonAnt></div>
          )}
          <Timer label="Espera que acabe el tiempo..."/>
        </div>
        <div className="col-start-1 col-end-3 row-start-2 row-end-3 md:row-start-1 md:row-end-2 md:col-start-2 md:col-end-3 mx-4 text-center">
          {props.children}
        </div>
        <div className={`text-center ${!props.lobby?.isAdmin && "self-center"} flex flex-row-reverse md:flex-col justify-around items-center`}>
          { props.lobby?.isAdmin && (
            <div className="inline-block md:mb-8"><ButtonAnt size="big" color="success" className="font-bold text-lg">Siguiente</ButtonAnt></div>
          )}
          <div>
            <div className="text-3xl md:text-5xl">5</div>
            <div className="text-base">respuestas</div>
          </div>
        </div>
      </div>

    </div>
  );
};


