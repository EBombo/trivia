import React from "reactn";
import { config, hostName } from "../../../../firebase";

export const Footer = (props) => (
  <div className="text-whiteLight flex flex-col md:flex-row md:justify-between items-center mx-4 py-4">
    <div className="text-lg md:text-2xl px-4 py-2">
      <span>Entra a </span>
      <span className="font-bold">{hostName}</span>
    </div>
    <div className="text-2xl px-4 py-2">
      <span>PIN </span>
      <span>{props.lobby?.pin}</span>
    </div>
  </div>
);
