const admin = require("firebase-admin");

admin.initializeApp();
const adminFirestore = admin.firestore;
const firestore = admin.firestore();
const database = admin.database();
const currentEnvironment = process.env.NODE_ENV;

try {
  firestore.settings({ ignoreUndefinedProperties: true });
} catch (error) {
  console.error("ignoreUndefinedProperties", error);
}

module.exports = {
  currentEnvironment,
  adminFirestore,
  firestore,
  database,
};
