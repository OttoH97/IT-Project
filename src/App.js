import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


function App() {

  const [welds, setWelds] = useState();

  useEffect(() => {
    axios.get('http://localhost:4000/welds')
      .then(response => setWelds(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
<div>
      <pre>{JSON.stringify(welds, null, 2)}</pre>
      </div>
  );
}


export default App;
