import styled,{ css , keyframes } from 'styled-components'
import sunny from './weather-icons/png/wsymbol_0001_sunny.png';
import cloudy from './weather-icons/png/wsymbol_0004_black_low_cloud.png';
import sunny_intervals from './weather-icons/png/wsymbol_0002_sunny_intervals.png';
import rainy from './weather-icons/png/wsymbol_0018_cloudy_with_heavy_rain.png';
import storm from './weather-icons/png/wsymbol_0024_thunderstorms.png';
import snowy from './weather-icons/png/wsymbol_0020_cloudy_with_heavy_snow.png';

export const MapContainer = styled.div`
    position: relative;
    overflow: hidden;
    width: 430px;
`;

export const Svg = styled.svg`
    transition: transform ease-in-out 0.4s;
    transform: ${props=>props.zoom && 'scale(2)'};
    transform-origin: ${props=>props.og==''?"50% 50%":props.og };
    overflow: visible;
`;

export const G = styled.g`
    fill: rebeccapurple;
    transition: 1s;
    fill-opacity: 0.65;
    stroke: #000000;
    stroke-width: 0.4px;
    transform: scale(0.7);
    transition: all ease-in-out .4s;
`;

export const PathD = styled.path`

    &:hover{
        fill-opacity: 1 !important;
    }
`;

export const Level1 = styled.div`
    transition: 0s;
    transition-delay: 0.4s;
    overflow: visible;
`;

export const Level2 = styled.div`

`;

const grow = keyframes`
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
`;


export const Icon = styled.div`
    //idk, this makes work the animation delay
    z-index: 1;
    overflow: visible;
    transition-delay: ${props=>props.visible && '2s'};
    transform: ${props=>!props.visible && 'scale(0) !important'};
    animation: ${props =>
        props.visible &&
        css`
        ${grow} 0.4s linear 0.4s forwards;
    `};
    position: absolute;
    width: 40px;
    height: 40px;
    pointer-events: none;
    top: ${props => props.top + "px" || "0px"};
    left: ${props => props.left + "px" || "0px"};
    background-size: contain;
    ${props => {
        const map = {
            "sunny": sunny,
            "sunny_intervals": sunny_intervals,
            "cloudy": cloudy,
            "rainy": rainy,
            "stormy": storm,
            "snowy": snowy,
        }
        return props.weather && 'background-image: url('+ map[props.weather] +')';
    }}
`;

export const IconBig = styled.div`
    //idk, this makes work the animation delay
    transition-delay: ${props=>!props.visible && '2s'};
    transform: ${props=>props.visible && 'scale(0)'};
    animation: ${props =>
        props.visible &&
        css`
        ${grow} 0.4s linear 0.4s forwards;
    `};
    position: absolute;
    width: 45px;
    height: 45px;
    pointer-events: none;
    top: ${props => props.top + "px" || "0px"};
    left: ${props => props.left + "px" || "0px"};
    background-size: contain;
    ${props => {
        const map = {
            "sunny": sunny,
            "sunny_intervals": sunny_intervals,
            "cloudy": cloudy,
            "rainy": rainy,
            "stormy": storm,
            "snowy": snowy,
        }
        return props.weather && 'background-image: url('+ map[props.weather] +')';
    }}
`;