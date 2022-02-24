import { firestore } from "../../firebase";
import { snapshotToArray } from "../../utils";

export const fetchUserByEmail = async (email, lobbyId) => {
  const userQuery = await firestore
    .collection("lobbies")
    .doc(lobbyId)
    .collection("users")
    .where("email", "==", email)
    .get();

  const currentUser = snapshotToArray(userQuery)[0];

  // Prevent currentUser is undefined.
  if (!currentUser) return;

  return currentUser;
};
