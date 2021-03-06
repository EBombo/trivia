import { checkIsCorrect, computePointsEarned } from "../../src/business";
import { DEFAULT_POINTS, OPEN_QUESTION_TYPE } from "../../src/components/common/DataList";

describe("Computation of points earned", () => {
  it("should compute points earned when timeLeft, questionTime and isCorrect are provided", () => {
    let answers = [];
    const questionTime = 10;

    for (let i = 0; i < questionTime; i++) {
      answers.push({
        timeLeft: questionTime - i,
        isCorrect: true,
        questionTime: questionTime,
      });
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      const points = computePointsEarned(answer.timeLeft, answer.questionTime, answer.isCorrect ? DEFAULT_POINTS : 0);
      console.log(
        `>>>> timeLeft: ${answer.timeLeft} questionTime: ${answer.questionTime} isCorrect: ${answer.isCorrect} => points ${points}`
      );

      expect(points).not.toBe(NaN);
    }
  });

  it("should compute points earned when questionTime and isCorrect are provided except timeLeft (undefined)", () => {
    let answers = [];
    const questionTime = 10;

    for (let i = 0; i < questionTime; i++) {
      answers.push({
        timeLeft: undefined,
        isCorrect: true,
        questionTime: questionTime,
      });
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      const points = computePointsEarned(answer.timeLeft, answer.questionTime, answer.isCorrect ? DEFAULT_POINTS : 0);
      console.log(
        `>>>> timeLeft: ${answer.timeLeft} questionTime: ${answer.questionTime} isCorrect: ${answer.isCorrect} => points ${points}`
      );

      expect(points).not.toBe(NaN);
    }
  });
});

describe("checkIsCorrect method", () => {
  it("when open question it should match all correct answers", () => {
    const question = {
      type: OPEN_QUESTION_TYPE,
      answer: ["reino cuántico ", "reino cuantico ", "quantum realm"],
    };
    const answer = "";

    checkIsCorrect(question, answer);
  });
});
