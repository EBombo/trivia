import chunk from "lodash/chunk";
import { firestore } from "../../../firebase";
import { snapshotToArray } from "../../../utils";
import type { Lobby } from "../../lobbies/expire/expireLobbies";

export const fetchLobbiesNotClosedAndCreatedLastHoursRef = async (lastHours: Date) => {
  const lobbiesQuery = await firestore
    .collection("lobbies")
    .where("isClosed", "==", false)
    .where("createAt", "<=", lastHours)
    .get();

  return snapshotToArray(lobbiesQuery);
};

const BATCH_MAX_LIMIT_TRANSACTION = 500;

type lobbyProps = Record<keyof Pick<Lobby, "isClosed">, boolean>;

export const updateLobbiesIsClosedField = async (lobbies: Lobby[], props: lobbyProps) => {
  const lobbiesRefsChunks = chunk(lobbies, BATCH_MAX_LIMIT_TRANSACTION);

  const lobbiesRef = firestore.collection("lobbies");

  const promises = lobbiesRefsChunks.map(async (lobbyRefsChunk) => {
    const batch = firestore.batch();

    lobbyRefsChunk.forEach((lobby) => batch.update(lobbiesRef.doc(lobby.id), props));

    await batch.commit();
  });

  await Promise.all(promises);
};
