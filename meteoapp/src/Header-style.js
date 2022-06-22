import styled, { keyframes } from "styled-components"
import searchIcon from './weather-icons/magnifying-glass-solid.svg'

export const Title = styled.h1`
    margin-bottom: 40px;
    margin-top: 20px;
    font-size: 4em;
    color: #fff;
`;

export const stretch = keyframes`
from {
  width: 60px;
}

to {
  width: 500px;
}
`;

export const Search = styled.div`

  & input{
    background-image: ${'url(' + searchIcon + ')'};
    background-position: 14px 12px;
    background-repeat: no-repeat;
    background-size: 37px;
    border: 0;
    border-radius: 60px;
    font-size: 18px;
    padding: 15px;
    height: 60px;
    width: 100%;
    box-shadow: 0 0 0 5px #5709d6;
  }

  & input[type=text]{
    padding-left: 70px;
  }

  & input:focus{
    outline: none;
  }

  & a{
    text-decoration: none;
  }

`

export const Searchinputs = styled.div`
  position: relative;
  animation: ${stretch} 0.5s ease-in forwards;
`;

export const Dataresult = styled.div`
  position: absolute;
  z-index: 5;
  width: 400px;
  margin-left: 50px;
  height: ${props=>props.height+10 + 'px'};
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 5px;
  overflow: hidden;
`;

export const Dataitem = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  color: black;
`;
