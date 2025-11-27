// src/pages/ResultPage.jsx
import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopHeader from '../components/Topheader';
import '../App.css';

// PDF 라이브러리
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state || {};

  // ─────────────────────────────────────────────
  // 업로드 페이지에서 넘어온 값들 (없으면 undefined)
  // ─────────────────────────────────────────────
  const uploadedMealTime = fromState.mealTime;      // '아침' / '점심' / '저녁'
  const uploadedImageUrl = fromState.imagePreview;  // 한 끼 업로드 미리보기 URL
  const threeMealPreviews = fromState.previews;     // 세 끼 업로드에서 넘긴 미리보기(선택 사항)

  // PDF 로 캡처할 영역
  const pdfRef = useRef(null);

  // ─────────────────────────────────────────────
  // 지금은 임시 더미 데이터 (나중에 백엔드 연결하면 교체)
  // ─────────────────────────────────────────────
  const summary = {
    totalKcal: 785,
    protein: 35,
    carb: 48,
    fat: 45,
  };

  const baseMeals = [
    {
      when: '아침',
      foodName: '수제 더블 치즈 버거',
      kcal: 785,
      macros: { protein: 20, carb: 40, fat: 25 },
      imageUrl: '/image/burger-sample.png',
    },
    {
      when: '점심',
      foodName: '식사를 하지 않았어요.',
      imageUrl: null,
      macros: null,
    },
    {
      when: '저녁',
      foodName: '식사를 하지 않았어요.',
      imageUrl: null,
      macros: null,
    },
  ];

  // ─────────────────────────────────────────────
  // 업로드 정보(한 끼 / 세 끼)를 반영해서 meals 완성
  // ─────────────────────────────────────────────
  let meals = baseMeals;

  // 1) 한 끼 업로드(OneMealUploadPage)에서 온 경우
  if (uploadedMealTime && uploadedImageUrl) {
    meals = meals.map((meal) =>
      meal.when === uploadedMealTime
        ? {
            ...meal,
            imageUrl: uploadedImageUrl,
            foodName: `${uploadedMealTime}에 드신 음식`,
          }
        : meal
    );
  }

  // 2) 세 끼 업로드(ThreeMealsUploadPage)에서 previews를 넘겨준 경우
  if (threeMealPreviews) {
    // key → label 매핑
    const keyToLabel = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
    };

    meals = meals.map((meal) => {
      // previews 객체에서 해당 끼니에 해당하는 URL 찾기
      const matchedKey = Object.keys(keyToLabel).find(
        (k) => keyToLabel[k] === meal.when
      );
      const url = matchedKey ? threeMealPreviews[matchedKey] : null;

      if (url) {
        return {
          ...meal,
          imageUrl: url,
          foodName: `${meal.when}에 드신 음식`,
        };
      }
      return meal;
    });
  }

  const aiSolution =
    '오늘은 탄수화물과 지방 비율이 다소 높아요. 내일은 단백질이 풍부한 식단을 추가해 보는 것을 추천합니다.';

  // ─────────────────────────────────────────────
  // PDF 저장 (여러 페이지 자동 분할)
  // ─────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 세로, 단위 pt
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();  // 595
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 842

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // 내용이 남아 있으면 계속 page 추가
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('mymeal_result.pdf');
  };

  return (
    <div className="app-container result-page">
      {/* 상단 초록색 헤더 (로고 클릭 시 랜딩 페이지로) */}
      <div className="hero-wrapper simple-hero">
        <TopHeader onLogoClick={() => navigate('/')} />
      </div>

      {/* 이 main 전체가 PDF로 저장됨 */}
      <main className="result-main" ref={pdfRef}>
        {/* 1. 오늘 하루 요약 박스 */}
        <section className="result-summary-card">
          <div className="result-summary-text">
            <h2>오늘 하루 총 {summary.totalKcal}kcal 먹었어요</h2>
            <p>
              단백질은 {summary.protein}g, 탄수화물은 {summary.carb}g, 지방은{' '}
              {summary.fat}g 섭취했어요 😌
            </p>
          </div>
          <img
            src="/image/robot4.png"
            alt="요약 로봇"
            className="result-summary-robot"
          />
        </section>

        {/* 2. 아침 / 점심 / 저녁 영역 */}
        <section className="result-meals-section">
          {meals.map((meal) => (
            <div key={meal.when} className="result-meal-row">
              {/* 왼쪽: 음식 사진 */}
              <div className="result-meal-image">
                {meal.imageUrl ? (
                  <img src={meal.imageUrl} alt={meal.foodName} />
                ) : (
                  <div className="result-meal-image-placeholder" />
                )}
              </div>

              {/* 오른쪽: 텍스트 + 그래프 자리 */}
              <div className="result-meal-info">
                <h3>{meal.when}</h3>
                <p className="result-meal-name">{meal.foodName}</p>

                <div className="result-meal-charts">
                  {/* 나중에 실제 도넛 차트 들어갈 자리 */}
                  <div className="result-chart-placeholder">단백질</div>
                  <div className="result-chart-placeholder">탄수화물</div>
                  <div className="result-chart-placeholder">지방</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 3. AI 건강 솔루션 (사각형 센터 + 로봇 왼쪽 하단 느낌은 CSS에서) */}
        <section className="result-solution-section">
          <img
            src="/image/robot5.png"
            alt="AI 솔루션 로봇"
            className="result-solution-robot"
          />
          <div className="result-solution-card">
            <h3>AI 건강 솔루션</h3>
            <p>{aiSolution}</p>
          </div>
        </section>

        {/* 4. PDF 저장 버튼 */}
        <section className="result-save-section">
          <button className="result-save-button" onClick={handleDownloadPdf}>
            AI 분석 결과 저장하기
          </button>
        </section>
      </main>
    </div>
  );
}
