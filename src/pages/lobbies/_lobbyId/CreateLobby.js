import { spinLoaderMin } from "../../../components/common/loader";
import React, { useEffect, useGlobal, useState } from "reactn";
import { config, firestore, firestoreBomboGames } from "../../../firebase";
import { useFetch } from "../../../hooks/useFetch";
import defaultTo from "lodash/defaultTo";
import { useRouter } from "next/router";
import styled from "styled-components";
import { ButtonAnt, Input, Select, Switch } from "../../../components/form";
import { useSendError, useUser } from "../../../hooks";
import { Image } from "../../../components/common/Image";
import { mediaQuery } from "../../../constants";

export const CreateLobby = (props) => {
  return (
    <div></div>
  );
};
