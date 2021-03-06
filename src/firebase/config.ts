import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/analytics";
import "firebase/storage";
import "firebase/database";
import "firebase/auth";
import isEmpty from "lodash/isEmpty";

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

const PORT = process.env.NEXT_PUBLIC_PORT ?? 5000;
console.log("process.env.NEXT_PUBLIC_PORT", PORT);

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "localhost:3001";
console.log("process.env.NEXT_PUBLIC_DOMAIN", DOMAIN);

const CONFIG = process.env.NEXT_PUBLIC_CONFIG ?? "";
//console.log("process.env.NEXT_PUBLIC_CONFIG", CONFIG);

const version = "0.2";

const config = JSON.parse(CONFIG);

const hostName = typeof window === "undefined" ? DOMAIN : window.location.hostname;

let bomboGamesDomain;

if (DOMAIN?.includes("local") || DOMAIN?.includes("red") || DOMAIN?.includes("dev")) {
  console.log("dev", version);
  bomboGamesDomain = "http://red.ebombo.io";
} else {
  console.log("prod", version);
  bomboGamesDomain = "http://ebombo.io";
}

let firestore: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;
let auth: firebase.auth.Auth;
let analytics: firebase.analytics.Analytics;
let database: firebase.database.Database;

let analyticsEvents: firebase.analytics.Analytics;
let firestoreEvents: firebase.firestore.Firestore;
let storageEvents: firebase.storage.Storage;
let authEvents: firebase.auth.Auth;

let firestoreBomboGames: firebase.firestore.Firestore;

// If it is empty, then it firebase projects should be initialized.
if (isEmpty(firebase.apps)) {
  // Default connection.
  try {
    console.log("initializeApp", isEmpty(firebase.apps));
    firebase.initializeApp(config.firebase);
  } catch (error) {
    console.error("error initializeApp", error);
  }
  // Events connection.
  try {
    firebase.initializeApp(config.firebaseEvents, "events");
  } catch (error) {
    console.error("error initializeApp", error);
  }
  // Bombo Games connection.
  try {
    firebase.initializeApp(config.firebaseBomboGames, "bombo-games");
  } catch (error) {
    console.error("error initializeApp", error);
  }
}

// Setting Up Firebase.
firestore = firebase.firestore();
database = firebase.database();
storage = firebase.storage();
auth = firebase.auth();

if (typeof window !== "undefined") analytics = firebase.analytics();

firestore.settings({ ignoreUndefinedProperties: true, merge: true });

// Setting Up Firebase Events.
firestoreEvents = firebase.app("events").firestore();
storageEvents = firebase.app("events").storage();
authEvents = firebase.app("events").auth();

if (typeof window !== "undefined") {
  analyticsEvents = firebase.app("events").analytics();
}

firestoreEvents.settings({ ignoreUndefinedProperties: true, merge: true });

// Setting Up Firebase Bombo Games.
firestoreBomboGames = firebase.app("bombo-games").firestore();

firestoreBomboGames.settings({ ignoreUndefinedProperties: true, merge: true });

if (DOMAIN?.includes("localhost")) {
  //config.serverUrl = config.serverUrlLocal;
  //firestore.useEmulator("localhost", 8080);
  //auth.useEmulator("http://localhost:9099/");
  //config.serverUrlBomboGames = config.serverUrlBomboGamesLocal;
}

export {
  bomboGamesDomain,
  analyticsEvents,
  firestoreEvents,
  firestoreBomboGames,
  storageEvents,
  authEvents,
  firestore,
  analytics,
  database,
  firebase,
  hostName,
  version,
  storage,
  config,
  auth,
};
