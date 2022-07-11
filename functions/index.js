const { firestore, adminFirestore } = require("./config");
const functions = require("firebase-functions");
const { log, error } = require("firebase-functions/lib/logger");
const get = require("lodash/get");

const isOnline = "online";

// Reference:
// https://firebase.google.com/docs/functions/database-events
// https://firebase.google.com/docs/firestore/solutions/presence
exports.presenceOnUpdate = functions.database
  .ref("/lobbies/{lobbyId}/users/{userId}")
  .onUpdate(async (change, context) => {
    try {
      const lobbyId = context.params.lobbyId;
      const userId = context.params.userId;

      const userOlder = change.before.val();
      const userOlderState = get(userOlder, "state", "").toLowerCase();

      const user = change.after.val();
      const userState = get(user, "state", "").toLowerCase();

      log(`user updated ${userState}`, user);
      log(`userOlder ${userOlderState}`, userOlder);
      log("onUpdate presence", lobbyId, userId);

      if (userState === userOlderState) {
        return log("is equals", userOlder.state, user.state);
      }

      const lobbySnapshot = await firestore.doc(`lobbies/${lobbyId}`).get();
      const lobby = lobbySnapshot.data();

      if (lobby?.isPlaying) return;
      if (lobby.startAt !== null) return;
      if (userState !== isOffLine) return;

      await firestore.doc(`lobbies/${lobbyId}`).update({ countPlayers: adminFirestore.FieldValue.increment(-1) });
    } catch (error) {
      error(error);
    }
  });
