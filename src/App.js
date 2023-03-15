import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {

  const [explanation, setExplanation] = useState('test');
      const [user, setUser] = useState('R12_K2023');
      const [weldId, setweldId] = useState("7b514c01-8a19-433b-81e1-5840c116f650")
  
      const handleClick = async () => {
        const url = `/api/v4/Welds/${weldId}/ChangeState`;
        const data = {
          explanation,
          user,
        };
        try {
          const response = await axios.post(url, data);
          console.log('response:', response.data);
        } catch (error) {
          console.error(error);
        }
      };

  return (
    
        <button onClick={handleClick}>Change Weld State</button>
      
   
  );
}

export default App;
