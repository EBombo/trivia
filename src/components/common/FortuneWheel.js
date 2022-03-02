import React from "reactn";
import styled from "styled-components";
import { Wheel } from "react-custom-roulette";
import { mediaQuery } from "../../constants";

const FortuneWheel = (props) => {
  const spin = (e) => {
    e.preventDefault();

    if (props.disabled) return props.setIsVisibleModalMessage(true);

    const newPrizeNumber = Math.floor(Math.random() * props.data.length);
    props.setPrizeNumber(newPrizeNumber);
    props.setMustSpin(true);
  };

  return (
    <CustomeWheel buttonColor={props.buttonColor} outerBorder={props.outerBorder}>
      <Wheel {...props} />
      <div className="bg-selector bg-contain bg-no-repeat	z-50 absolute top-[8%] right-[2%] w-[17%] h-[118px]" />
      {props.isAdmin && (
        <div className="btn-container">
          <button className="spin" onClick={(e) => spin(e)}>
            GIRAR
          </button>
        </div>
      )}
    </CustomeWheel>
  );
};

const CustomeWheel = styled.div`
  width: max-content;
  position: relative;

  div:first-child {
    margin: 0 auto;
  }

  img {
    top: 5% !important;
    right: 2% !important;
    display: none;
  }

  .btn-container {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 50;
    transform: translate(-50%, -50%);
    padding: 0.5rem;
    border-radius: 50%;
    background: ${(props) => props.buttonColor ?? props.theme.basic.gray};
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }

  .spin {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${(props) => props.buttonColor ?? props.theme.basic.gray};
    font-size: 18px;
    font-weight: bold;
    color: ${(props) => props.theme.basic.black};
    box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  }

  ${mediaQuery.afterTablet} {
    div:first-child {
      max-width: 700px !important;
      max-height: 700px !important;
    }

    .spin {
      width: 100px;
      height: 100px;
    }
  }
`;

export default FortuneWheel;
