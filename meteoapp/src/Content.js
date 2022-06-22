import './content.css';
import MeteoMap from './MeteoMap'
import MeteoCard from './MeteoCard'
import DateSelection from './DateSelection'
import styled from 'styled-components'
import { useState } from 'react';

const ContentFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
`;

function Content({ forecast, location }) {

  const [selectedDay, setSelectedday] = useState(0)

  return (
    <>
      <DateSelection selDay={selectedDay} changeDay={setSelectedday}/>
      <ContentFlex>
         <MeteoMap selDay={selectedDay}/>
         <MeteoCard selDay={selectedDay} location={location} forecast={forecast}/>  
      </ContentFlex>
    </>
  );
}

export default Content;