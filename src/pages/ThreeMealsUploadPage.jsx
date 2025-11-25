// src/pages/ThreeMealsUploadPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/Topheader';
import '../App.css';

const MEALS = [
  { key: 'breakfast', label: '아침' },
  { key: 'lunch', label: '점심' },
  { key: 'dinner', label: '저녁' },
];

export default function ThreeMealsUploadPage() {
  const navigate = useNavigate();

  // 단계: 1 = 세 칸(아침/점심/저녁) 카드, 2 = 큰 드롭존, 3 = 미리보기/버튼
  const [step, setStep] = useState(1);

  // 현재 어떤 끼니를 업로드 중인지 기록
  const [currentMeal, setCurrentMeal] = useState(null); // 'breakfast' | 'lunch' | 'dinner'

  // 각 끼니별 업로드 파일 / 미리보기
  const [files, setFiles] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  const [previews, setPreviews] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  const fileInputRef = useRef(null);

  const handleLogoClick = () => navigate('/');

  // ① 어떤 끼니 카드(아침/점심/저녁)를 눌렀는지
  const startUploadForMeal = (mealKey) => {
    setCurrentMeal(mealKey);
    setStep(2); // 큰 드롭존 단계로 이동
  };

  // 공통: 파일 선택/드롭 → 해당 끼니에 파일 저장 + 미리보기 + 3단계 화면으로 이동
  const handleFileSelected = (file) => {
    if (!file || !currentMeal) return;

    const url = URL.createObjectURL(file);

    setFiles((prev) => ({
      ...prev,
      [currentMeal]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [currentMeal]: url,
    }));

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
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // ③ “AI 분석 결과 확인하기” 버튼
  const handleCheckResult = () => {
    const uploadedCount = MEALS.filter((m) => files[m.key]).length;

    if (uploadedCount === 0) {
      alert('최소 1개 이상의 끼니 사진을 업로드해 주세요.');
      return;
    }

    const uploadedMeals = MEALS.filter((m) => files[m.key])
      .map((m) => m.label)
      .join(', ');

    alert(
      `업로드된 끼니: ${uploadedMeals}\n(나중에 여기에서 AI 분석 결과 화면)`
    );
  };

  const hasAnyImage = MEALS.some((m) => previews[m.key]);
  const canAnalyze = hasAnyImage;

  return (
    <div className="app-container">
      {/* 상단 초록색 바 + 상단 고정 로고 */}
      <div className="hero-wrapper simple-hero">
        <TopHeader onLogoClick={handleLogoClick} />
      </div>

      {/* 메인 영역 */}
      <main className="scan-mode-main">
        {/* 서비스 로고 & 설명 */}
        <section className="scan-logo-block">
            <img
                src="/image/oneMealLogo.png"
                alt="한끼스캔 (OneMeal Scan)"
                className="scan-main-logo"
            />

            {step === 2 ? (
                //  STEP 2 에서만 나오는 문구
                <>
                <h2>음식 사진을 올리면 AI가 영양정보를 분석해드립니다.</h2>
                <p className="scan-subtitle">
                    음식 사진을 드래그하거나 클릭하여 업로드해 주세요.
                </p>
                </>
            ) : (
                //  STEP 1 & STEP 3 에서 나오는 기본 문구
                <>
                <h2>당신의 건강한 습관을 위해, 매일의 식사를 똑똑하게 기록해 드릴게요.</h2>
                <p className="scan-subtitle">
                    AI가 이미지를 스캔하여 어떤 음식인지, 몇 칼로리인지 자동으로 계산해 드립니다.
                </p>
                </>
            )}
            </section>

        {/* STEP 1 – 아침/점심/저녁 세 칸 업로드 카드 */}
        {step === 1 && (
          <section className="three-upload-grid">
            {MEALS.map((meal) => (
              <div key={meal.key} className="three-upload-item">
                <button
                  className="three-upload-card"
                  type="button"
                  onClick={() => startUploadForMeal(meal.key)}
                >
                  <img
                    src="/image/oneMealUpload.png" 
                    alt="사진 업로드"
                    className="three-upload-icon"
                  />
                </button>
                <div className="three-upload-label">{meal.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* STEP 2 – 큰 드래그&드롭 영역 (선택한 끼니 한 번에 하나만) */}
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
                  e.stopPropagation();
                  openFileDialog();
                }}
              >
                사진 선택하기
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </section>
        )}

        {/* STEP 3 – 각 끼니별 미리보기 + 다시 업로드 가능 + 버튼 */}
        {step === 3 && (
          <>
            {/* 끼니별 썸네일 영역 */}
            <section className="three-preview-grid">
              {MEALS.map((meal) => {
                const imgUrl = previews[meal.key];

                // 카드 클릭하면 해당 끼니 다시 업로드(2단계)로
                const handleClickCard = () => {
                  setCurrentMeal(meal.key);
                  setStep(2);
                };

                return (
                  <div key={meal.key} className="three-preview-item">
                    <button
                      type="button"
                      className={
                        imgUrl
                          ? 'three-preview-card has-image'
                          : 'three-preview-card'
                      }
                      onClick={handleClickCard}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`${meal.label} 식사 사진`}
                          className="three-preview-image"
                        />
                      ) : (
                        <div className="three-preview-empty">
                          <img
                            src="/image/oneMealUpload.png"
                            alt="사진 업로드"
                            className="three-upload-icon"
                          />
                
                        </div>
                      )}
                    </button>
                    <div className="three-upload-label">{meal.label}</div>
                  </div>
                );
              })}
            </section>

            {/* 분석 버튼 + 안내 문구 */}
            <section className="upload-action-wrapper">
            <button
                type="button"
                className={`analysis-button ${ !hasAnyImage ? 'analysis-button-disabled' : '' }`}
                disabled={!hasAnyImage}
                onClick={handleCheckResult}
            >
                AI 분석 결과 확인하기
                <span className="analysis-button-icon">➜</span>
            </button>

            <p className="analysis-note">
                ** 사진을 1개 이상 업로드 할 경우에만 버튼이 활성화됩니다.
            </p>
            </section>

            {/* 3단계에서도 다시 파일 변경 가능 */}
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
