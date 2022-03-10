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

// kahoot scoring [1-(r/q/2)]p
// r = time left, q = total time, p = points
export const computePointsEarned = (timeLeft, totalTime, point) =>
  (1 - ((totalTime - timeLeft) / totalTime / 2)) * point;
