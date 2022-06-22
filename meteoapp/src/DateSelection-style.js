import styled from 'styled-components'

export const WeekList = styled.div`
    display: flex;
    flex-direction:row;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    transform: scale(0.7);
    gap: 10px;
`;

export const DayOfWeek = styled.div`
    display: block;
    position: relative;
    text-align: center;
    font-family: 'Helvetica', sans-serif;
    cursor: pointer;
    width: 100px;
    height: 110px;
    margin: 20px 0px;
    background: #fff;
    transition: 200ms;
    opacity: ${props => props.selected ? "100%" : "80%"};
    z-index: ${props => props.selected ? "1" : "auto"};
    transform: ${props => props.selected ? 'scale(1.3)' : 'scale(1)'};

    &:hover{
        z-index: 1; 
        opacity: 100%;
    }

    & *{
        pointer-events: none;
    }
`;

export const Binds = styled.span`
    position: absolute;
    height: 15px;
    width: 62px;
    background: transparent;
    border: 2px solid #999;
    border-width: 0 5px;
    top: -6px;
    left: 0;
    right: 0;
    margin: auto;
`;


export const Day = styled.span`
    background: #555;
    display: block;
    padding: 6px 0;
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    border-bottom: 2px solid #333;
`;


export const Number = styled.h1`
    display: block;
    margin: 0;
    padding: 0;
    font-size: 48px;
    box-shadow: 0 0 3px #ccc;
    color: #000000;
    position: relative;
`;

