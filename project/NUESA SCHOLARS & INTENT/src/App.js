import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import "./styles/App.css";
import LiveAuction from "./components/LiveAuction";
import "./styles/App-container.css";
import SplashScreen from "./components/SplashScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuctionForm from "./components/AuctionForm";
import Home from "./components/Home"; 
import ChatWidget from "./components/ChatWidget";
import ExplorePage from "./components/ExplorePage";


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Navbar />
       <ChatWidget />
      <Routes>
        <Route path="/home-home" element={<Home />} />
        <Route path="/Explore-page" element={<ExplorePage />} />
        <Route path="/create-auction" element={<AuctionForm />} />
        <Route path="/live-auction" element={<LiveAuction />} />
      </Routes>
    </Router>
  );
}

export default App;