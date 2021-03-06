import { config } from "../../firebase";

export const avatars = [
  `${config.storageUrl}/resources/avatars/dog.svg`,
  `${config.storageUrl}/resources/avatars/fox.svg`,
  `${config.storageUrl}/resources/avatars/deer.svg`,
  `${config.storageUrl}/resources/avatars/cat.svg`,
  `${config.storageUrl}/resources/avatars/cow.svg`,
  `${config.storageUrl}/resources/avatars/pig.svg`,
  `${config.storageUrl}/resources/avatars/monkey.svg`,
  `${config.storageUrl}/resources/avatars/chicken.svg`,
  `${config.storageUrl}/resources/avatars/panda.svg`,
];

export const adminMenus = [
  {
    value: "home",
    url: "/home",
  },
  {
    value: "users",
    url: "/admin/users",
  },
  {
    value: "manifests",
    url: "/admin/settings/manifests",
  },
  {
    value: "templates",
    url: "/admin/settings/templates",
  },
  {
    value: "seo",
    url: "/admin/seo",
  },
];

export const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const defaultHandMan = {
  head: "hidden",
  leftLeg: "hidden",
  rightLeg: "hidden",
  leftArm: "hidden",
  rightArm: "hidden",
  trunk: "hidden",
};

export const limbsOrder = Object.keys(defaultHandMan);

export const languages = [
  { key: "spanish", value: "es", name: "Español" },
  { key: "english", value: "en", name: "Inglés" },
];

// Game states.
export const INITIALIZING = "INITIALIZING";
export const INTRODUCING_QUESTION = "INTRODUCING_QUESTION";
export const ANSWERING_QUESTION = "ANSWERING_QUESTION";
export const QUESTION_TIMEOUT = "QUESTION_TIMEOUT";
export const COMPUTING_RANKING = "COMPUTING_RANKING";
export const RANKING = "RANKING";

// Type questions.
export const TRUE_FALSE_QUESTION_TYPE = "trueFalse";
export const ALTERNATIVES_QUESTION_TYPE = "quiz";
export const OPEN_QUESTION_TYPE = "shortAnswer";

export const getIconUrl = (color) =>
  color === "red"
    ? `${config.storageUrl}/resources/red-star.svg`
    : color === "blue"
    ? `${config.storageUrl}/resources/blue-square.svg`
    : color === "green"
    ? `${config.storageUrl}/resources/green-circle.svg`
    : color === "yellow"
    ? `${config.storageUrl}/resources/yellow-triangle.svg`
    : "";

export const DEFAULT_POINTS = 100;
