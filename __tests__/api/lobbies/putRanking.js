import { computeRanking } from "../../../src/api/lobbies/_lobbyId/ranking/putRanking"

describe('Ranking sort', () => {
  it('should return an ordered ranking list by player score', () => {

    const users = [
      {nickname: "mateo", id: "CBwynuKu6oEwHvhtmnm5"},
      {nickname: "santi", id: "ygvhWw0WARvTCzPkyehx"},
    ];

    const answers = [
      {
        "answer": true,
        "createAt": new Date(),
        "points": 97.5,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 19,
        "updateAt": new Date(),
        "user": {
          id: "CBwynuKu6oEwHvhtmnm5",
          nickname: "mateo",
        }, 
        userId: "CBwynuKu6oEwHvhtmnm5"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      }
    ];

    const invalidQuestions = [];

    const sortedRanking = computeRanking(users, answers, invalidQuestions);

    expect(sortedRanking.length).toBe(2);

    const firstPlace = sortedRanking[0];
    const secondPlace = sortedRanking[1];

    expect(firstPlace.rank).toBe(1);
    expect(firstPlace.nickname).toBe("santi");

    expect(secondPlace.rank).toBe(2);
    expect(secondPlace.nickname).toBe("mateo");
  });

  it('when an unidentified user has an answer recorded in answers but not in users list', () => {

    const users = [
      {nickname: "mateo", id: "CBwynuKu6oEwHvhtmnm5"},
      {nickname: "santi", id: "ygvhWw0WARvTCzPkyehx"},
    ];

    const answers = [
      {
        "answer": true,
        "createAt": new Date(),
        "points": 97.5,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 19,
        "updateAt": new Date(),
        "user": {
          id: "CBwynuKu6oEwHvhtmnm5",
          nickname: "mateo",
        }, 
        userId: "CBwynuKu6oEwHvhtmnm5"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "ygvhWw0WARvTCzPkyehx",
          nickname: "santi",
        },
        userId: "ygvhWw0WARvTCzPkyehx"
      },
      {
        "answer": true,
        "createAt": new Date(),
        "points": 100,
        "questionId": "5VTIdUTIUcBv4iOlWxMD",
        "questionNumber": 4,
        "questionTime": 20,
        "secondtLeft": 20,
        "updateAt": new Date(),
        "user": {
          id: "123456789",
          nickname: "morbius",
        },
        userId: "123456789"
      }
    ];

    const invalidQuestions = [];

    const sortedRanking = computeRanking(users, answers, invalidQuestions);

    expect(sortedRanking.length).toBe(3);

  });
});
