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
      const user = change.after.val();

      if (get(userOlder, "state") === get(user, "state")) return log("is equals", userOlder.state, user.state);

      log({ lobbyId });
      log({ userId });
      log("userOlder", userOlder);
      log("user updated", user);

      // User gets disconnected.
      if (get(user, "state") !== isOnline) {
        await firestore.doc(`lobbies/${lobbyId}`).update({ countPlayers: adminFirestore.FieldValue.increment(-1) });
      }
    } catch (error_) {
      error(error_);
    }
  });
