import React, { useState, useEffect, useRef, useCallback } from "reactn";
import styled from "styled-components";
import { Image } from "../../../../components/common/Image";
import { config } from "../../../../firebase";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { _animate } from "../../../../utils/popmotion";
import delay from "lodash/delay";

const ANIMATION_NORMAL_DURATION = 3000;

export const Winner = (props) => {
  const [award, setAward] = useState(null);

  const prizeIconRef = useRef();

  const winnerLabelRef = useRef();

  const firstPlaceBgRef = useRef();
  const firstPlaceNameRef = useRef();

  // animation for 2nd and 3rd place only
  useEffect(() => {
    if (props.index === 0) return;

    const prizeIconNode = prizeIconRef.current;

    if (!prizeIconNode) return;

    const winnerLabelNode = winnerLabelRef.current;

    const playAnimation = () => {
      const prizeIconCloned = prizeIconNode.cloneNode();

      prizeIconCloned.style.opacity = 1;
      prizeIconCloned.style.zIndex = 10;

      const { width: nodeWidth, height: nodeHeight } = prizeIconNode.getBoundingClientRect();

      const clonePositionStart = {
        x: window.innerWidth / 2 - nodeWidth / 2,
        y: window.innerHeight / 2 - nodeHeight / 2,
        scale: 0,
      };

      const clonePositionMid = {
        x: window.innerWidth / 2 - nodeWidth / 2,
        y: window.innerHeight / 2 - nodeHeight / 2,
        scale: 1,
      };

      const clonePositionEnd = { x: prizeIconNode.offsetLeft, y: prizeIconNode.offsetTop, scale: 1 };

      prizeIconCloned.style.position = "absolute";
      prizeIconCloned.style.left = `${clonePositionStart.x}px`;
      prizeIconCloned.style.top = `${clonePositionStart.y}px`;
      prizeIconCloned.style.transform = "scale(0.1)";

      const updatePrizeIconCloned = (tween) => {
        prizeIconCloned.style.transform = `scale(${tween.scale})`;
        prizeIconCloned.style.top = `${tween.y}px`;
        prizeIconCloned.style.left = `${tween.x}px`;
      };

      document.body.appendChild(prizeIconCloned);

      _animate({
        from: clonePositionStart,
        to: clonePositionMid,
        duration: 1000,
        elapsed: -3000 * (2 - props.index),
        onUpdate: (tween) => {
          updatePrizeIconCloned(tween);
        },
      })
        .then(() =>
          _animate({
            from: clonePositionMid,
            to: clonePositionEnd,
            elapsed: -1000,
            duration: 1000,
            onUpdate: (tween) => {
              updatePrizeIconCloned(tween);
            },
          })
        )
        .then(() => {
          winnerLabelNode.style.maxWidth = `1000px`;
          winnerLabelNode.style.opacity = 1;

          prizeIconNode.style.opacity = 1;

          prizeIconCloned.remove();
        });
    };

    if (props.enableAnimation) playAnimation();
  }, [prizeIconRef]);

  // animation for 1st place only
  useEffect(() => {
    if (props.index !== 0) return;

    const prizeIconNode = prizeIconRef.current;

    if (!prizeIconNode) return;

    const winnerLabelNode = winnerLabelRef.current;

    const playAnimation = () => {
      const prizeIconCloned = prizeIconNode.cloneNode();

      prizeIconCloned.style.opacity = 1;
      prizeIconCloned.style.zIndex = 10;

      const { width: nodeWidth, height: nodeHeight } = prizeIconNode.getBoundingClientRect();

      const clonePositionStart = {
        x: window.innerWidth / 2 - nodeWidth / 2,
        y: window.innerHeight / 2 - nodeHeight / 2,
        scale: 0,
      };

      const clonePositionStep1 = {
        x: window.innerWidth / 2 - nodeWidth / 2,
        y: window.innerHeight / 2 - nodeHeight / 2,
        scale: 1,
      };

      const clonePositionStep2 = {
        x: window.innerWidth / 2 - nodeWidth / 2,
        y: window.innerHeight / 2 - nodeHeight / 2 - 150,
        scale: 1,
      };

      const clonePositionEnd = { x: prizeIconNode.offsetLeft, y: prizeIconNode.offsetTop, scale: 1 };

      prizeIconCloned.style.position = "absolute";
      prizeIconCloned.style.left = `${clonePositionStart.x}px`;
      prizeIconCloned.style.top = `${clonePositionStart.y}px`;
      prizeIconCloned.style.transform = "scale(0.1)";

      const updatePrizeIconCloned = (tween) => {
        prizeIconCloned.style.transform = `scale(${tween.scale})`;
        prizeIconCloned.style.top = `${tween.y}px`;
        prizeIconCloned.style.left = `${tween.x}px`;
      };

      document.body.appendChild(prizeIconCloned);

      // first place animation
      prizeIconCloned.style.zIndex = 30;

      const firstPlaceBgNode = firstPlaceBgRef.current;
      firstPlaceBgNode.style.zIndex = 20;

      const firstPlaceNameNode = firstPlaceNameRef.current;
      const { width: firstPlaceNameNodeWidth, height: firstPlaceNameNodeHeight } =
        firstPlaceNameNode.getBoundingClientRect();

      delay(() => {
        _animate({
          from: 1,
          to: 0.5,
          duration: 1000,
          onPlay: () => {
            firstPlaceBgNode.style.opacity = 1;
          },
          onUpdate: (tween) => {
            const firstPlaceBgNode = firstPlaceBgRef.current;

            firstPlaceBgNode.style.transform = `scaleX(${tween})`;
          },
        });
      }, 2 * ANIMATION_NORMAL_DURATION);

      return (
        _animate({
          from: clonePositionStart,
          to: clonePositionStep1,
          duration: 1000,
          elapsed: -ANIMATION_NORMAL_DURATION * (2 - props.index) - 1000,
          onUpdate: (tween) => {
            updatePrizeIconCloned(tween);
          },
        })
          // shows winner name animation
          .then(() =>
            _animate({
              from: { y: 0, opacity: 0 },
              to: { y: 130 + 20, opacity: 1 },
              duration: 1000,
              onPlay: () => {
                firstPlaceNameNode.style.opacity = "0";
                firstPlaceNameNode.style.position = "absolute";
                firstPlaceNameNode.style.top = `${window.innerHeight / 2 - firstPlaceNameNodeHeight / 2}px`;
                firstPlaceNameNode.style.left = `${window.innerWidth / 2 - firstPlaceNameNodeWidth / 2}px`;
              },
              onUpdate: (tween) => {
                const prizeIconRefY = window.innerHeight / 2 - nodeHeight / 2;

                prizeIconCloned.style.top = `${prizeIconRefY - tween.y}px`;

                firstPlaceNameNode.style.opacity = tween.opacity;
              },
            })
          )
          // first bounce winner's name animation
          .then(() => {
            const firstPlaceNameNodeX0 = parseInt(firstPlaceNameNode.style.left);

            return _animate({
              from: { x: 0, rotate: "0deg", opacity: 0 },
              to: { x: firstPlaceNameNodeWidth / 2, rotate: "-15deg", opacity: 1 },
              duration: 1000,
              onUpdate: (tween) => {
                firstPlaceNameNode.style.left = `${firstPlaceNameNodeX0 - tween.x}px`;
                firstPlaceNameNode.style.transform = `rotate(${tween.rotate})`;
              },
            });
          })
          // repetitive bounce winner's name animation
          .then(() => {
            const firstPlaceNameNodeX0 = parseInt(firstPlaceNameNode.style.left);

            return _animate({
              from: { x: 0, rotate: "-15deg" },
              to: { x: firstPlaceNameNodeWidth, rotate: "15deg" },
              repeat: 3,
              repeatType: "reverse",
              duration: 1000,
              onUpdate: (tween) => {
                firstPlaceNameNode.style.left = `${firstPlaceNameNodeX0 + tween.x}px`;
                firstPlaceNameNode.style.transform = `rotate(${tween.rotate})`;
              },
            });
          })
          // back original position winner's name animation
          .then(() => {
            const firstPlaceNameNodeX0 = parseInt(firstPlaceNameNode.style.left);

            _animate({
              from: { x: 0, rotate: "-15deg" },
              to: { x: firstPlaceNameNodeWidth / 2, rotate: "0deg" },
              duration: 1000,
              onUpdate: (tween) => {
                firstPlaceNameNode.style.left = `${firstPlaceNameNodeX0 + tween.x}px`;
                firstPlaceNameNode.style.transform = `rotate(${tween.rotate})`;
              },
            });
          })
          // close up animation
          .then(() =>
            _animate({
              from: { x: 0, opacity: 1, bgScaleX: 0.5 },
              to: { x: firstPlaceNameNodeWidth / 2, opacity: 0, bgScaleX: 0 },
              duration: 1000,
              onUpdate: (tween) => {
                // bg vanishes
                firstPlaceBgNode.style.transform = `scaleX(${tween.bgScaleX})`;

                firstPlaceNameNode.style.opacity = tween.opacity;
              },
            })
          )
          // icon goes back original position
          .then(() =>
            _animate({
              from: clonePositionStep2,
              to: clonePositionEnd,
              elapsed: -1000,
              duration: 1000,
              onUpdate: (tween) => {
                updatePrizeIconCloned(tween);
              },
            })
          )
          .then(() => {
            winnerLabelNode.style.maxWidth = `1000px`;
            winnerLabelNode.style.opacity = 1;

            prizeIconNode.style.opacity = 1;
            prizeIconCloned.remove();
          })
      );
    };

    if (props.enableAnimation) playAnimation();
  }, [prizeIconRef, firstPlaceBgRef]);

  return (
    <WinnerCss award={award} isList={props.isList}>
      {!props.isList && (
        <Image
          className={`${props.enableAnimation && "opacity-0"}`}
          src={`${config.storageUrl}/resources/icon-${props.index + 1}.svg`}
          height="100px"
          width="100px"
          desktopHeight="130px"
          desktopWidth="130px"
          zIndex="2"
          margin="auto"
          innerRef={prizeIconRef}
        />
      )}
      <div
        className={`${props.enableAnimation && "opacity-0 max-w-[10px]"} grid font-bold transition-all duration-500 ${
          props.award && "mt-[30px]"
        }`}
        ref={winnerLabelRef}
      >
        <div
          className={`my-auto ${
            props.isList ? "ml-0" : "ml-[-50px]"
          } text-3xl cursor-pointer flex h-[fit-content] rounded-lg text-black bg-white py-3 pl-14 pr-3 z-[1]`}
          onClick={() => setAward(award ? null : props.winner.award?.name)}
        >
          {props.winner.nickname} {props.winner.award?.name && (award ? <CaretUpOutlined /> : <CaretDownOutlined />)}
        </div>

        {award && (
          <div
            className={`bg-grayLighten rounded
          mt-[-10px] mb-auto ${props.isList ? "ml-0" : "ml-[-30px]"}
          pt-[24px] pr-[15px] pb-[15px] pl-[3rem]
          text-secondary text-2xl`}
          >
            {award}
          </div>
        )}
      </div>

      {props.index === 0 && (
        <div
          className="absolute z-30 opacity-0 bg-white p-4 text-secondary text-2xl font-bold rounded-lg"
          ref={firstPlaceNameRef}
        >
          {props.winner.nickname}
        </div>
      )}

      {props.index === 0 && (
        <Image
          className="z-20 pointer-events-none"
          src={`${config.storageUrl}/resources/first-place-bg.svg`}
          height="100vh"
          width="100vw"
          zIndex="2"
          innerRef={firstPlaceBgRef}
          style={{ position: "absolute", top: "0", left: "0", bottom: "0", opacity: "0" }}
        />
      )}
    </WinnerCss>
  );
};

const WinnerCss = styled.div`
  display: grid;
  margin: ${(props) => (props.isList ? "5px auto" : "20px auto")};
  ${(props) => (props.isList ? "" : "grid-template-columns: 150px 4fr;")}

  .anticon {
    color: ${(props) => props.theme.basic.secondary};
    margin: auto 0 auto auto;
  }
`;
