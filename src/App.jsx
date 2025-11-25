// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import ScanModePage from './pages/ScanModePage';
import OneMealUploadPage from './pages/OneMealUploadPage';
import ThreeMealsUploadPage from './pages/ThreeMealsUploadPage';
export default function App() {
  return (
    <Routes>
      {/* 1페이지: 랜딩 */}
      <Route path="/" element={<LandingPage />} />

      {/* 2페이지: 스캔 모드 선택 */}
      <Route path="/scan-mode" element={<ScanModePage />} />

      {/* 3페이지: 한 끼 업로드 */}
      <Route path="/upload/one-meal" element={<OneMealUploadPage />} />
        
      <Route path="/upload/three-meals" element={<ThreeMealsUploadPage />} /> 
    </Routes>
  );
}
