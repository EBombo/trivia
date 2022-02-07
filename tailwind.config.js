const CONFIG = process.env.NEXT_PUBLIC_CONFIG ?? "";

const config = JSON.parse(CONFIG);

module.exports = {
  mode: "jit",
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        success: "#56EEA5",
        successDark: "#3FA876",
        successLight: "#77f1b7",
        primary: "#956DFC",
        primaryDark: "#5D449E",
        primaryLight: "#C4ADFF",
        primaryDarken: "#754EDA",
        secondary: "#382079",
        secondaryDark: "#170D33",
        secondaryDarken: "#221545",
        secondaryLight: "#2E2547",
        secondaryWithTransparency: "#382079c2",
        white: "#ffffff",
        whiteDarken: "#D2D2D2",
        whiteDark: "#F2F2F2",
        whiteLight: "#FAFAFA",
        warning: "#FFC715",
        warningDark: "#A9840E",
        danger: "#DE0F0F",
        dangerDark: "#AC162C",
        default: "#494949",
        black: "#000000",
        blackLighten: "#404040",
        blackDarken: "#242424",
        grayDarken: "#585858",
        grayDark: "#A3A3A3",
        grayLight: "#666666",
        grayLighten: "#C4C4C4",
        gray: "#E4E4E4",
        secondGray: "#EFEFEF",
      },
      backgroundImage: (theme) => ({
        selector: `url('${config.storageUrl}/resources/selector.png')`,
        "lobby-pattern": `url('${config.storageUrl}/resources/coral-pattern-tablet.svg')`,
      }),
    },
  },
  plugins: [],
};
