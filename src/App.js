import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {

    const [xmlData, setXmlData] = useState(null);
  
    useEffect(() => {
      axios.get('/welds')
        .then(response => {
          // Parse XML data using xml2js library
          parseString(response.data, function(err, result) {
            if (err) {
              console.error(err);
            } else {
              setXmlData(result);
            }
          });
        })
        .catch(error => {
          console.error(error);
        });
    }, []);
  
    return (
      <div>
        {xmlData ? (
          <pre>{JSON.stringify(xmlData, null, 2)}</pre>
        ) : (
          <p>Loading XML data...</p>
        )}
      </div>
    );
  
}

export default App;
