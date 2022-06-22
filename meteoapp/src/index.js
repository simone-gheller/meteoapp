import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Header from './Header'
import Content from './Content'
import Footer from './Footer'
import reportWebVitals from './reportWebVitals';
import styled from 'styled-components'
import { useState } from 'react';

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function Body() {

  const [forecast, setForecast] = useState(null)
  const [location, setLocation] = useState({city:"Milano",prov:"MI"})

  return (
    <Flex>
      <Header setForecast={setForecast} location={location} setLocation={setLocation}/>
      <Content forecast={forecast} location={location}/>
      <Footer /> 
    </Flex>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Body />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
