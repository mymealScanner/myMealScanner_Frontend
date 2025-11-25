// src/pages/ScanModePage.jsx
import React from 'react';
import TopHeader from '../components/Topheader.jsx';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function ScanModePage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {/* 상단 초록색 바 + 로고 버튼 */}
      <div className="hero-wrapper simple-hero">
        <TopHeader onLogoClick={() => navigate('/')} />
      </div>

      {/* 본문 */}
      <main className="scan-mode-main">
        {/* 서비스 로고 & 설명 영역 */}
        <section className="scan-logo-block">
          
          <img
            src="/image/oneMealLogo.png"
            alt="한끼스캔 (OneMeal Scan)"
            className="scan-main-logo"
          />
          <h2>당신의 건강한 식습관을 한끼스캔과 함께하세요.</h2>
          <p className="scan-subtitle">
            AI가 이미지를 스캔하여 어떤 음식인지, 몇 칼로리인지 자동으로 계산해 드립니다.
          </p>
        </section>

        {/* 카드 2개 영역 */}
        <section className="scan-card-row">
          {/* 지금 한끼 스캔 카드 */}
          <div className="scan-card-wrapper">
            <button
              className="scan-card"
              onClick={() => navigate('/upload/one-meal')}
            >
              {/* 한 끼 카드 배경 이미지 */}
              <img
                src="/image/scan-once.png"
                alt="지금 한끼 스캔"
                className="scan-card-bg"
                />
              <span className="scan-card-title">지금 한끼 스캔</span>
            </button>

            {/* 왼쪽 로봇 */}
            <img
              src="/image/robot2.png"
              alt="로봇"
              className="scan-robot scan-robot-left"
            />
          </div>

          {/* 하루 세끼 스캔 카드 */}
          <div className="scan-card-wrapper">
            <button
                className="scan-card"
                onClick={() => navigate('/upload/three-meals')} 
                >
                <img
                    src="/image/scan-three.png"
                    alt="하루 세끼 스캔"
                    className="scan-card-bg"
                />
                <span className="scan-card-title">하루 세끼 스캔</span>
             </button>

            {/* 오른쪽 로봇 */}
            <img
              src="/image/robot3.png"
              alt="로봇"
              className="scan-robot scan-robot-right"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
