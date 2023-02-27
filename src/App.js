import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {

  const [welds, setWelds] = useState([]);

  useEffect(() => {
    fetch('/welds')
      .then(response => response.json())
      .then(data => setWelds(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <pre>{JSON.stringify(welds, null, 2)}</pre>
    </div>
  );
  
}

export default App;
