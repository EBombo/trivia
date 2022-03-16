import React from "reactn";
import { hostName } from "../../../../firebase";

export const Footer = (props) => (
  <div className="text-whiteLight flex flex-col md:flex-row md:justify-between items-center mx-4 min-h-[50px]">
    <div className="text-lg md:text-xl px-4 py-2">
      <span className="font-normal">Entra a: </span>
      <span className="font-bold">{hostName}</span>
    </div>
    <div className="text-xl px-4 py-2">
      <span className="font-normal">PIN: </span>
      <span>{props.lobby?.pin}</span>
    </div>
  </div>
);
