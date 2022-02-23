import React, { useGlobal, useState, useMemo } from "reactn";
import { config } from "../../../../firebase";
import { Input, ButtonAnt } from "../../../../components/form";

export const OpenAnswerCard = (props) => {

  return (
    <div className="relative flex flex-col justify-center">
      <div className={`p-5`}>
        <Input />
      </div>
      <div className="self-center">
        <ButtonAnt color="success" size="big"><span className="font-bold text-lg px-4">Enviar</span></ButtonAnt>
      </div>
    </div>
  );
};

