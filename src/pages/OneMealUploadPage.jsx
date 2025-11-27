// src/pages/OneMealUploadPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import TopHeader from '../components/Topheader';



export default function OneMealUploadPage() {
  const navigate = useNavigate();

  // 단계: 1 = 작은 '사진 업로드' 카드, 2 = 큰 드래그존, 3 = 업로드 후 미리보기
  const [step, setStep] = useState(1);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mealTime, setMealTime] = useState(''); // 아침 / 점심 / 저녁

  const fileInputRef = useRef(null);

  const handleGoHome = () => navigate('/');

  // 공통: 파일 선택 → 미리보기 세팅 + 3단계 화면으로 이동
  const handleFileSelected = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep(3);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCheckResult = () => {
    if (!imageFile) {
      alert('먼저 사진을 업로드해 주세요.');
      return;
    }
    if (!mealTime) {
      alert('식사 시간을 선택해 주세요.');
      return;
    }
    // 아직 백엔드는 없으니까 일단 알림만
    navigate('/result', {
      state: {
        mode: 'oneMeal',       // 어디서 왔는지 표시용 (선택사항)
        mealTime,              // '아침' / '점심' / '저녁'
        imagePreview,          // 미리보기 URL
      },
      });
  };

  return (
    <div className="app-container">
      {/* 상단 초록색 바 */}
      <div className="hero-wrapper simple-hero">
        <TopHeader onLogoClick={() => navigate('/')} />
      </div>

      {/* 메인 영역 */}
      <main className="scan-mode-main">
        <section className="scan-logo-block">
          <img
            src="/image/oneMealLogo.png"
            alt="한끼스캔 (OneMeal Scan)"
            className="scan-main-logo"
          />
          {step === 1 && (
            <>
              <h2>당신의 건강한 습관을 위해, 매일의 식사를 똑똑하게 기록해 드릴게요.</h2>
              <p className="scan-subtitle">
                AI가 이미지를 스캔하여 어떤 음식인지, 몇 칼로리인지 자동으로 계산합니다.
              </p>
            </>
          )}
          {step === 2 && (
            <>
            <h2>음식 사진을 올리면 AI가 영양정보를 분석해드립니다.</h2>
            <p className="scan-subtitle">
                AI가 이미지를 스캔하여 어떤 음식인지, 몇 칼로리인지 자동으로 계산해 드립니다.
            </p>
            </>
         )}
        {/* 3단계 : 업로드 후 미리보기 + 드롭다운 화면 */}
          {step === 3 && (
            <>
            <h2>당신의 건강한 습관을 위해, 매일의 식사를 똑똑하게 기록해 드릴게요.</h2>
            <p className="scan-subtitle">
                AI가 이미지를 스캔하여 어떤 음식인지, 몇 칼로리인지 자동으로 계산합니다.
            </p>
            </>
          )}
        </section>
        

        {/* 1단계 : 작은 '사진 업로드' 카드 */}
        {step === 1 && (
            <section className="upload-step1-wrapper">
                <button
                className="upload-step1-card"
                onClick={() => setStep(2)}
                >
              <img
                src="/image/oneMealUpload.png"
                alt="사진 업로드"
                className="upload-step1-icon-img"
                />
                </button>
            </section>
            )}

        {/* 2단계 : 큰 드래그 & 드롭 영역 */}
        {step === 2 && (
          <section className="upload-step2-wrapper">
            <div
              className="upload-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={openFileDialog}
            >
              <div className="upload-drop-icon">⬆</div>
              <p className="upload-drop-title">
                음식 사진을 드래그하거나 클릭하여 업로드 하세요
              </p>
              <p className="upload-drop-desc">
                JPG, PNG 등의 이미지 파일을 업로드할 수 있습니다.
              </p>
              <button
                type="button"
                className="upload-select-button"
                onClick={(e) => {
                  e.stopPropagation(); // 부모 onClick(파일창)랑 섞이지 않게
                  openFileDialog();
                }}
              >
                사진 선택하기
              </button>
            </div>

            {/* 실제 파일 input (숨김) */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </section>
        )}

        {/* 3단계 : 업로드된 사진 + 드롭다운 + 버튼 */}
        {step === 3 && (
          <>
            <section className="upload-preview-wrapper">
              <div className="upload-preview-card">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="업로드된 음식 사진"
                    className="upload-preview-image"
                  />
                )}
              </div>

              <div className="upload-meta-block">
                <label className="upload-meta-label">
                  오늘 하루 중 언제 식사를 하셨나요?
                </label>
                <p className="upload-meta-helper">
                  아침, 점심, 저녁 중 하나를 선택해 주세요.
                </p>

                <select
                  className="upload-meal-select"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                >
                  <option value="">식사 시간을 선택해 주세요</option>
                  <option value="아침">아침</option>
                  <option value="점심">점심</option>
                  <option value="저녁">저녁</option>
                </select>
              </div>
            </section>

            <section className="upload-action-wrapper">
              <button
                type="button"
                className="analysis-button"
                onClick={handleCheckResult}
              >
                AI 분석 결과 확인하기
                <span className="analysis-button-icon">➜</span>
              </button>
            </section>

            {/* 숨겨진 파일 input (3단계에서도 다시 선택 가능하게) */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}
      </main>
    </div>
  );
}
