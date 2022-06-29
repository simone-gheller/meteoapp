import { Title, Search, Icon, Searchinputs, SearchIcon, Dataresult, Dataitem} from './Header-style'
import React, { useState, useEffect, useRef } from 'react';
import comuni from './comuni-lightweight.json';
import config from './config';


function Header({setForecast, location, setLocation}) {

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [submit, setSubmit] = useState(false)
  const [hideSuggs, setHidesuggs] = useState(false)

  const divref = useRef(null)

  useEffect(() => {

    function handleClickOutside(event) {
      if (divref.current && !divref.current.contains(event.target)) {
        setHidesuggs(true)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [divref]);

  useEffect(()=>{
    if(query!=''){
      const first5 = [];
      comuni.find(i => ((i.n.toLowerCase().startsWith(query.toLowerCase()) && first5.push(i), first5.length >= 5)));
      setResults(first5)
      setHidesuggs(false)
    }
  },[query])

  useEffect(()=>{
    async function handleItalyRequest(){
      try {
          let response = await fetch(`${config.urls.CITY}?location=${location.city}`);
          if(!response.ok)
              throw Error(response.statusText)
          let data = await response.json();
          setForecast(data)
      } catch (error) {
          alert(error)
      }
    }
    console.log(process.env.REACT_APP_STAGE)
    console.log(config)
    handleItalyRequest();

  },[])

  useEffect(()=>{
    async function handleItalyRequest(){
      if(submit){
        try {
          let response = await fetch(`${config.urls.CITY}?location=${query}`);
          if(!response.ok)
              throw Error(response.statusText)
          let data = await response.json();
          setForecast(data)
          setLocation({city:query.charAt(0).toUpperCase() + query.slice(1), prov:data['prov']})
        } catch (error) {
            alert(error)
        }
      }
    }
    handleItalyRequest();
    setSubmit(false)
  },[submit])

  function handleChange(e){
    setQuery(e.target.value)
  }

  function onSubmit(e){
    if (e.key === 'Enter') {
      console.log('enter');
      setSubmit(true)
    }
  }

  return (
    <>
      <Title>Che tempo fa</Title>
      <Search ref={divref}>
        <Searchinputs>
          <input
            type="text"
            placeholder="Inserisci una località"
            value={query}
            onChange={handleChange}
            onKeyDown={onSubmit}
          />
        </Searchinputs>
        {query.length != 0 && !hideSuggs && (
          <Dataresult  height={30*results.length}>
            {results.map((value, key) => {
              return (
                <Dataitem key={key} onClick={()=>{
                  setQuery(value.n);
                  setSubmit(true)
                }}>
                  {value.n}
                </Dataitem>
              );
            })}
          </Dataresult>
        )}
      </Search>
    </>
  );
}

export default Header;