import { Title, Search, Icon, Searchinputs, SearchIcon, Dataresult, Dataitem} from './Header-style'
import React, { useState, useEffect } from 'react';
import comuni from './comuni-lightweight.json'


function Header({setForecast, location, setLocation}) {

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [submit, setSubmit] = useState(false)

  useEffect(()=>{
    if(query!=''){
      const first5 = [];
      comuni.find(i => ((i.n.toLowerCase().startsWith(query.toLowerCase()) && first5.push(i), first5.length >= 5)));
      setResults(first5)
    }
  },[query])

  useEffect(()=>{
    async function handleItalyRequest(){
      try {
          let response = await fetch(`http://127.0.0.1:3001/?location=${location.city}`);
          if(!response.ok)
              throw Error(response.statusText)
          let data = await response.json();
          setForecast(data)
      } catch (error) {
          alert(error)
      }
    }
    handleItalyRequest();
  },[])

  useEffect(()=>{
    async function handleItalyRequest(){
      if(submit){
        try {
          let response = await fetch(`http://127.0.0.1:3001/?location=${query}`);
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
      <Search>
        <Searchinputs>
          <input
            type="text"
            placeholder="Inserisci una località"
            value={query}
            onChange={handleChange}
            onKeyDown={onSubmit}
          />
        </Searchinputs>
        {query.length != 0 && (
          <Dataresult height={30*results.length}>
            {results.map((value, key) => {
              return (
                <Dataitem key={key}>
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