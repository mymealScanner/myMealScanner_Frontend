// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import ScanModePage from './pages/ScanModePage';
import OneMealUploadPage from './pages/OneMealUploadPage';
import ThreeMealsUploadPage from './pages/ThreeMealsUploadPage';
import ResultPage from './pages/ResultPage';
export default function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/scan-mode" element={<ScanModePage />} />

      <Route path="/upload/one-meal" element={<OneMealUploadPage />} />
        
      <Route path="/upload/three-meals" element={<ThreeMealsUploadPage />} /> 
      <Route path="result" element={<ResultPage />} />
    </Routes>
  );
}
