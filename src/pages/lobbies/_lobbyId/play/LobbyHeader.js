import React, { useGlobal, useState } from "reactn";
import { useRouter } from "next/router";
import { Timer } from "./Timer";

export const LobbyHeader = (props) => {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [authUser] = useGlobal("user");

  return (
    <div className="grid grid-rows-[minmax(160px,min-content)_auto]">
      <div className="bg-whiteLight py-4 text-center text-2xl md:text-3xl font-bold flex">
        <div className="self-center w-full text-secondaryDarken">
          ¿Esta es una pregunta muy achorada muy achorada muy achorad muy achoradaa muy achoradaa  muy achoradaa muy achorada muy achorada muy achoradaaaa?
        </div>
      </div>
      <div className="grid grid-cols-[2fr_1fr] grid-rows-[auto auto] md:grid-cols-[1fr_3fr_1fr] md:grid-rows-1 text-whiteLight mb-8">
        <div className="self-center">
          <Timer label="Espera que acabe el tiempo..."/>
        </div>
        <div className="col-start-1 col-end-3 row-start-2 row-end-3 md:row-start-1 md:row-end-2 md:col-start-2 md:col-end-3 mx-4">
          <div className="aspect-[3/1] w-full h-[270px] bg-secondaryDark"></div>
        </div>
        <div className="text-center self-center">
          <div className="text-3xl md:text-5xl">5</div>
          <div className="text-base">respuestas</div>
        </div>
      </div>

    </div>
  );
};


