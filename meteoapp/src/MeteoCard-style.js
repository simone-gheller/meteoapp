import styled from 'styled-components';

export const ForecastCard = styled.div`
background-color: #6F13E0;
border-radius: 15px;
color:#fff;
`

export const CityForecastCard = styled.div`
margin: 40px;
display: flex;
flex-direction: column;
align-items: center;

& p{
    display: flex;
    padding-left: 3px;
    padding-right: 3px;
    font-weight: 500;
    font-size: 16px;
}

& h3{
    font-size: 2em;
}
`

export const VisualCityForecastCard = styled.div`
display: flex;
flex-direction: row;
align-items: center;
padding: 0px 50px;

& img{
    margin: 3px 10px;
}

& p{
    display: flex;
    flex-direction: row;
    font-size: 3em;
    font-weight: normal;
}

`
export const Temperatures = styled.div`
width: 80%;
margin-top: 10px;   
`

export const CardTable = styled.table`
width: 100%;
table-layout: auto;  

& td:nth-child(2) { 
    text-align: end; 
}
`

export const VisualIcon = styled.img`
width: 120px;
`

export const Divisor = styled.hr`
border: 0;
border-top: 2px solid white;
width: 90%;
margin-bottom: 10px;
margin-top: 10px;
`

export const CardCaption = styled.p`
margin: 5px;
`