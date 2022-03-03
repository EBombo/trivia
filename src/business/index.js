import find from "lodash/find";

export const ANIMATION = {
  min: 4,
  max: 10,
  default: 6,
};

export const SPEED = {
  min: 5,
  max: 20,
  default: 10,
};

export const getCurrentQuestion = (questions, currentQuestionNumber) =>
  find(questions, (q) => q.questionNumber === currentQuestionNumber);
