import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import { useRouter } from "next/router";
import { config, firestore } from "../../../../firebase";
import { InPlaySpinLoader } from "./InPlaySpinLoader";
import { Image } from "../../../../components/common/Image";
import { useTranslation } from "../../../../hooks";
import { triviaQuestionsTypes } from "./DataList";
import { ChartBarResultCard } from "./ChartBarResultCard";
import { QuestionResults } from "./QuestionResults";

export const ResultCard = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  const { t } = useTranslation();

  const [authUser] = useGlobal("user");

  const [userRank, setUserRank] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  const isSurvey = useMemo(() => {
    return props.question.type === triviaQuestionsTypes.survey.key;
  }, [props.question.type]);

  const isBrainStorm = useMemo(() => {
    return props.question.type === triviaQuestionsTypes.brainstorm.key;
  }, [props.question.type]);

  const isSlide = useMemo(() => {
    return props.question.type === triviaQuestionsTypes.slide.key;
  }, [props.question.type]);

  const currentQuestionNumber = useMemo(() => {
    return props.lobby.game.currentQuestionNumber ?? 1;
  }, [props.lobby.game]);

  const usersSize = useMemo(() => {
    return props.lobby?.countPlayers ?? 0;
  }, [props.lobby?.countPlayers]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userSnapshot = await firestore.doc(`lobbies/${lobbyId}/users/${authUser.id}`).get();
      const user = userSnapshot.data();

      const lastPointsEarnedFromQuestionNumber = user.lastPointsEarnedFromQuestionNumber;

      setPointsEarned(user.lastPointsEarned ?? 0);

      setStreakCount(user.streak ?? 0);

      setUserScore(user.score ?? 0);
      setUserRank(user.rank ?? 0);

      if (lastPointsEarnedFromQuestionNumber !== currentQuestionNumber) return setIsCorrect(false);

      setIsCorrect(user.isLastAnswerCorrect);
    };

    fetchUsers();
  }, []);

  const header = useMemo(() => {
    if (isSlide) return null;
    if (isSurvey) return null;
    if (isBrainStorm) return null;

    return isCorrect ? (
      <Image src={`${config.storageUrl}/resources/check-with-depth.svg`} width="16px" />
    ) : (
      <Image src={`${config.storageUrl}/resources/cross-with-depth.svg`} width="16px" />
    );
  }, [isCorrect, isSurvey]);

  const footer = useMemo(() => {
    if (isSlide) return null;
    if (isSurvey) return null;
    if (isBrainStorm) return null;

    return (
      <>
        <div className="text-black">
          {t("pages.lobby.in-play.current-score")}: {userScore?.toFixed(1)} pts
        </div>
        <div className="text-black">
          {t("pages.lobby.in-play.rank")}: {userRank}/{usersSize !== 0 ? usersSize : "--"}
        </div>
      </>
    );
  }, [isCorrect, isSurvey, isBrainStorm, isSlide]);

  const { bgColor, textColor } = useMemo(() => {
    if (isSurvey || isBrainStorm || isSlide)
      return {
        bgColor: "bg-primary",
        textColor: "text-whiteLight",
      };

    return isCorrect
      ? { bgColor: "bg-success", textColor: "text-secondaryDarken" }
      : { bgColor: "bg-danger", textColor: "text-whiteLight" };
  }, [isCorrect, isSurvey, isBrainStorm, isSlide]);

  /** Return loading. **/
  if (isCorrect === null)
    return (
      <div className="relative my-4 mx-4 pt-8 pb-4 px-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
        <InPlaySpinLoader />
      </div>
    );

  return (
    <>
      {isBrainStorm ? null : (
        <div className="relative my-4 mx-4 pt-8 pb-4 px-4 bg-whiteLight text-lg min-w-[300px] self-center rounded-lg">
          <div
            className={`absolute top-[-20px] left-1/2 translate-x-[-50%]
          ${bgColor} 
          ${textColor}
          rounded max-w-[280px] whitespace-nowrap px-8`}
          >
            <span className="inline-block py-4 pr-4 align-middle">{header}</span>

            {isSurvey || isSlide
              ? t("pages.lobby.in-play.thanks-answer")
              : isCorrect
              ? t("pages.lobby.in-play.correct-answer")
              : t("pages.lobby.in-play.incorrect-answer")}
          </div>

          {isSurvey ? (
            <>
              <div className="text-black text-3xl py-8">{t("pages.lobby.in-play.your-answer")}:</div>
              <div className="text-black text-2xl pb-8">
                {props.question?.options ? props.question?.options[props.userAnswered?.answer] : null}
              </div>
            </>
          ) : isCorrect ? (
            <>
              <div className="text-secondaryDarken">
                <span className="inline-block py-4 align-middle">
                  <Image src={`${config.storageUrl}/resources/red-fire-streak.svg`} size="contain" width="12px" />
                </span>
                {t("pages.lobby.in-play.answers-streak")}: {streakCount}
              </div>
              <div className="text-black text-3xl py-8">
                +{pointsEarned?.toFixed(1)} {t("pages.lobby.in-play.points")}
              </div>
            </>
          ) : (
            <div className="text-secondaryDarken">{t("pages.lobby.in-play.help-phrase-after-fail")} </div>
          )}

          {footer}
        </div>
      )}

      {isSurvey ? <ChartBarResultCard {...props} /> : null}
      {isBrainStorm ? <QuestionResults {...props} /> : null}
    </>
  );
};
