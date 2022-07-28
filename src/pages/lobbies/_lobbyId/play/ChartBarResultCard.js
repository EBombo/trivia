import React from "reactn";
import { colors } from "./DataList";
import styled from "styled-components";

export const ChartBarResultCard = (props) => {
  const totalSelected = props.question.options
    .map((value, index) => {
      if (typeof answer !== "number") return 0;

      return props.question[`totalAnswerSelected${index}`] ?? 0;
    })
    .reduce((sum, value) => {
      return sum + value;
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
              <div className="text-white">{getPercentage(props.question[`totalAnswerSelected${index}`])}%</div>

              <Bar
                className={`${colors[index]} rounded m-[5px]`}
                height={getPercentage(props.question[`totalAnswerSelected${index}`])}
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
