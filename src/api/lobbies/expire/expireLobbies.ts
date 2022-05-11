import moment from "moment";
import get from "lodash/get";
import { fetchLobbiesNotClosedAndCreatedLastHoursRef, updateLobbiesIsClosedField } from "../../collections/lobbies";
import type { NextApiRequest, NextApiResponse } from "next";

export type Lobby = {
  id: string;
  deleted: boolean;
  answersCount?: number;
  countPlayers?: number;
  gameId: string;
  isLocked: boolean;
  isPlaying: boolean;
  notDoublePrice: boolean;
  pin: string;
  playersCount: number;
  updateAt: Date;
  createAt: Date;
  isClosed: boolean;
  settings: any;
  game: any;
};

const LAST_HOURS_TO_RETRIEVE = 5;

export const expireLobbies = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("expireLobbies ->", req.query, req.body);

    const lastHours = currentDatetimeWithOffsetHours(LAST_HOURS_TO_RETRIEVE);

    const lobbies = await fetchLobbiesNotClosedAndCreatedLastHoursRef(lastHours);

    if (!get(lobbies, "length")) {
      console.log("lobbies is empty:", lobbies);
      return res.send({ success: false });
    }

    await updateLobbiesIsClosedField(lobbies, { isClosed: true });

    return res.send({ success: true });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    return res.status(500).send({ error: error?.message ?? "Something went wrong" });
  }
};

const currentDatetimeWithOffsetHours = (offsetHours: number) => moment().subtract(offsetHours, "hours").toDate();
