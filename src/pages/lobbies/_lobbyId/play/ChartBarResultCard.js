import React from "reactn";
import styled from "styled-components";

const colors = ["bg-inGameRed", "bg-inGameBlue", "bg-inGameGreen", "bg-inGameYellow"];

export const ChartBarResultCard = (props) => {
  const totalSelected = Object.values(props.question.totalAnswerSelected).reduce((sum, total) => {
    return sum + total;
  }, 0);

  const getPercentage = (value = 0) => {
    const percentage = (value * 100) / totalSelected;
    return +percentage.toFixed(0);
  };

  return (
    <div className="grid grid-cols-[auto_auto_auto_auto] w-[80%] mx-auto mt-[3rem]">
      {props.question.options.map((option, index) => {
        return (
          <div key={option} className="h-[10rem] relative">
            <div className="absolute bottom-0 w-full">
              <div className="text-white">{getPercentage(props.question.totalAnswerSelected[index])}%</div>

              <Bar
                className={`${colors[index]} rounded m-[5px]`}
                height={getPercentage(props.question.totalAnswerSelected[index])}
              />

              <div className={`${colors[index]} rounded m-[5px] h-[1.5rem]`} />

              <div className="text-white">{option}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Bar = styled.div`
  height: ${(props) => (props.height ? `${props.height}px` : "0px")};
`;
