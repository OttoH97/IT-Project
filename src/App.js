import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import SideBar from "./components/sidebar/SideBar";
import Content from "./components/content/Content";
import { useLocation } from "react-router-dom"
import Email from "./components/content/Email";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const location = useLocation();
  const tulos = location.pathname.split('/')
  let id = tulos[1];

  const updateWidth = () => {
    const width = window.innerWidth;
    const widthLimit = 576;
    const isMobile = width <= widthLimit;
    const wasMobile = previousWidth <= widthLimit;

    if (isMobile !== wasMobile) {
      setIsOpen(!isMobile);
    }

    previousWidth = width;
  };

  let previousWidth = -1;

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App wrapper">
      <SideBar toggle={toggle} isOpen={isOpen} />
      {id !== 'mail' ? <Content toggle={toggle} isOpen={isOpen} isMobile={isMobile} /> : <Email toggle={toggle} isOpen={isOpen} isMobile={isMobile}/>}
    </div>
  );
}

export default App;