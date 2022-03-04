import React, { useGlobal, useMemo } from "reactn";
import { config, hostName } from "../../../../firebase";
import { Image } from "../../../../components/common/Image";
import { ButtonAnt } from "../../../../components/form/Button";

export const Scoreboard = (props) => {
  const ranking = (props.ranking ?? [{}, {}, {}, {}, {}]).slice(0, 5);

  const [authUser] = useGlobal("user");

  const isLastQuestion =  useMemo(() =>
    (props.currentQuestionNumber >= props.questions.length),
    [props.lobby.game]);

  const RankingItem = (user, i) => (
    <div
      key={`rankint-item-${i}`}
      className="grid grid-cols-[min-content_auto_min-content] bg-secondaryDark text-whiteLight py-4 w-full max-w-[1000px] md:mx-auto text-lg md:text-2xl my-4"
    >
      <div className={`px-5 self-center ${props.authUser?.id === user.id ? "text-success" : "text-whiteLight"}`}>1</div>
      <div
        className={`px-4 self-center justify-self-start ${
          props.authUser?.id === user.id ? "text-success" : "text-whiteLight"
        }`}
      >
        Santiago
      </div>
      <div className="px-4 whitespace-nowrap">1000 pts</div>
    </div>
  );

  return (
    <div className="font-['Lato'] font-bold bg-secondary bg-center bg-contain bg-lobby-pattern w-screen overflow-auto text-center">
      <div className="min-h-[calc(100vh-50px)] flex flex-col py-5 bg-opacity-50 px-4">
        {authUser.isAdmin && !isLastQuestion && (
          <div className="mb-20 flex justify-end">
            <ButtonAnt
              color="success"
              width="200px"
              className="font-bold text-xl px-8"
              onClick={() => props.onGoToNextQuestion?.()}>
              Siguiente
            </ButtonAnt>
          </div>
        )}

        <div className="mb-6">{ranking.map((_, i) => RankingItem(_, i))}</div>

        <div
          className={`
          w-full max-w-[1000px] md:mx-auto my-4 text-xl md:text-2xl text-whiteLight text-left
          after:inline-block after:w-[82%] md:after:w-[86%] after:h-[2px] after:relative after:content-[''] after:bottom-1 after:left-6 after:ml-0.5 after:bg-whiteLight`}
        >
          Tu puesto
        </div>

        {RankingItem({}, 0)}

        {authUser.isAdmin && (
          <div className="my-6 text-center flex justify-center">
            <ButtonAnt
              color="danger"
              width="200px"
              className="inline-block font-bold text-lg px-8"
              onClick={() => props.onCloseLobby?.()}>
              Finalizar
            </ButtonAnt>
          </div>
        )}
      </div>
    </div>
  );
};
