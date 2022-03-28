import { animate } from "popmotion";

export const _animate = (propAnim) => {
  return new Promise((resolve, _) => {
    let stopAnimation = animate({
      ...propAnim,
      onUpdate: (tween) => {
        propAnim.onUpdate(tween, stopAnimation);
      },
      onComplete: () => {
        resolve();
      },
    });
  });
};
