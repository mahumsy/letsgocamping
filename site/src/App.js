import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import LandingPage from "./pages/LandingPage";
import SearchParks from "./pages/SearchParks";
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
                <Route path="/login" testId="test-login" element={<Login />} /> {}
                <Route path="/home" element={<Home />} /> {}
                <Route path="/search" element={<SearchParks />} />
                <Route path="/Favorites" element={<Favorites />} />
                <Route path="/compare" element={<Compare />} />
            </Routes>
        </div>
    );
}

export default App