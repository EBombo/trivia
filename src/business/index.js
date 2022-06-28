import find from "lodash/find";
import {
  ALTERNATIVES_QUESTION_TYPE,
  OPEN_QUESTION_TYPE,
  TRUE_FALSE_QUESTION_TYPE,
} from "../components/common/DataList";
import { config } from "../firebase";

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
  (1 - (totalTime - (timeLeft ?? totalTime)) / totalTime / 2) * point;

export const checkIsCorrect = (question, answer) => {
  if (question.type === ALTERNATIVES_QUESTION_TYPE) {
    return question.answer.includes(answer);
  }

  if (question.type === OPEN_QUESTION_TYPE) {
    const correctAnswers = question.answerPattern || question.answer;

    for (let i = 0; i < correctAnswers.length; i++) {
      const answerPattern = new RegExp(correctAnswers[i], "gi");

      if (answer.match(answerPattern) !== null) return true;
    }

    return false;
  }

  /** By default, it will be TRUE_FALSE_QUESTION_TYPE. **/
  //if (question.type === TRUE_FALSE_QUESTION_TYPE)
  return answer === question.answer;
};

export const reserveLobbySeat = async (Fetch, lobbyId, userId, newUser) => {
  const GAME_NAME = "trivia";

  const fetchProps = {
    url: `${config.serverUrlBomboGames}/${GAME_NAME}/lobbies/${lobbyId}/seat`,
    method: "PUT",
  };

  const { error, response } = await Fetch(fetchProps.url, fetchProps.method, {
    userId,
    newUser,
  });

  if (error) throw new Error(error?.error || error);

  return response;
};
