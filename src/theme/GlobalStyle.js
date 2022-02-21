import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`

  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.basic.blackDarken};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.basic.primary};
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.basic.action};
  }

  /*-------------- SWITCH ANT----------------*/
  
  .ant-switch-checked {
    background-color: ${(props) => props.theme.basic.success} !important;
  }
`;
