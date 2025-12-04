// src/pages/ResultPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopHeader from '../components/Topheader';
import '../App.css';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* -------------------------------------------------
   영양 텍스트 → 백엔드로 보낼 nutritionInfo 문자열 만들기
-------------------------------------------------- */
function buildNutritionInfo(mode, meals, summary) {
  if (mode === 'threeMeals') {
    // 아침 / 점심 / 저녁 각각 한 줄씩
    return meals
      .map((m) => {
        if (!m.kcal && !m.macrosGram) {
          return `${m.when}: 식사 없음`;
        }
        const carb = m.macrosGram?.carb ?? 0;
        const protein = m.macrosGram?.protein ?? 0;
        const fat = m.macrosGram?.fat ?? 0;
        return `${m.when}: ${m.foodName} 탄수화물 ${carb.toFixed(
          1
        )}g, 단백질 ${protein.toFixed(1)}g, 지방 ${fat.toFixed(1)}g`;
      })
      .join('\n');
  }

  if (mode === 'oneMeal') {
    const meal = meals.find((m) => m.macrosPercent);
    if (!meal) return '';
    return `${meal.when}: ${meal.foodName} 총 ${summary.totalKcal.toFixed(
      1
    )}kcal, 탄수화물 ${meal.macrosPercent.carbPercent}%, 단백질 ${
      meal.macrosPercent.proteinPercent
    }%, 지방 ${meal.macrosPercent.fatPercent}%`;
  }

  return '';
}

/* -------------------------------------------------
   도넛 차트 컴포넌트
-------------------------------------------------- */
function MacroDonutChart({ carb, protein, fat }) {
  const total = carb + protein + fat;
  if (!total) return null;

  const carbPercent = (carb / total) * 100;
  const proteinPercent = (protein / total) * 100;
  const fatPercent = (fat / total) * 100;

  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const carbLen = (carbPercent / 100) * circumference;
  const proteinLen = (proteinPercent / 100) * circumference;
  const fatLen = (fatPercent / 100) * circumference;

  const offsets = {
    carb: 0,
    protein: -carbLen,
    fat: -(carbLen + proteinLen),
  };

  return (
    <div className="macro-donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#bbcc5cff"
            strokeWidth={strokeWidth}
            strokeDasharray={`${carbLen} ${circumference}`}
            strokeDashoffset={offsets.carb}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#168aad"
            strokeWidth={strokeWidth}
            strokeDasharray={`${proteinLen} ${circumference}`}
            strokeDashoffset={offsets.protein}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#52b69a"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fatLen} ${circumference}`}
            strokeDashoffset={offsets.fat}
          />
        </g>
      </svg>

      <div className="macro-donut-center-text">
        <div className="macro-center-pill macro-center-carb">
          탄 {carbPercent.toFixed(0)}%
        </div>
        <div className="macro-center-pill macro-center-protein">
          단 {proteinPercent.toFixed(0)}%
        </div>
        <div className="macro-center-pill macro-center-fat">
          지 {fatPercent.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

// 결과페이지
export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state || {};

  const mode = fromState.mode || 'oneMeal'; // 'oneMeal' | 'threeMeals'

  // oneMeal 쪽 데이터
  const uploadedMealTime = fromState.mealTime;
  const uploadedImageUrl = fromState.imagePreview;
  const detect = fromState.detect;
  const recipe = fromState.recipe;

  // threeMeals 쪽 데이터
  const threeMealsData = fromState.meals || {};

  const pdfRef = useRef(null);

  // AI 솔루션 상태
  const [aiSolution, setAiSolution] = useState('');
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState(null);

  // 요약/끼니별 데이터 계산
  let summary = {
    kind: 'none',
    totalKcal: 0,
    carbPercent: 0,
    proteinPercent: 0,
    fatPercent: 0,
    totalCarb: 0,
    totalProtein: 0,
    totalFat: 0,
  };

  let meals = [];

  // 1) 한 끼 스캔(oneMeal)
  if (mode === 'oneMeal') {
    const baseWhen = uploadedMealTime || '식사';

    meals = [
      {
        when: baseWhen,
        foodName: '식사를 하지 않았어요.',
        imageUrl: null,
        kcal: null,
        macrosPercent: null,
        macrosGram: null,
      },
    ];

    if (recipe) {
      const kcal = recipe.kcal ?? 0;
      const proteinRate = recipe.proteinRate ?? 0;
      const carbRate = recipe.carbRate ?? 0;
      const fatRateRaw = recipe.fatRate ?? (1 - proteinRate - carbRate);
      const fatRate = fatRateRaw < 0 ? 0 : fatRateRaw;

      // g 단위 계산 (탄/단 4kcal, 지방 9kcal 기준)
      let carbGram = 0;
      let proteinGram = 0;
      let fatGram = 0;

      if (kcal > 0) {
        carbGram = (kcal * carbRate) / 4;
        proteinGram = (kcal * proteinRate) / 4;
        fatGram = (kcal * fatRate) / 9;
      }

      summary = {
        ...summary,
        kind: 'gram',
        totalKcal: kcal,
        carbPercent: Math.round(carbRate * 100),
        proteinPercent: Math.round(proteinRate * 100),
        fatPercent: Math.round(fatRate * 100),
        totalCarb: carbGram,
        totalProtein: proteinGram,
        totalFat: fatGram,
      };

      meals = meals.map((meal) => ({
        ...meal,
        imageUrl: uploadedImageUrl || null,
        foodName: detect?.foodName
          ? detect.foodName
          : `${baseWhen}에 드신 음식`,
        kcal: kcal || null,
        macrosPercent:
          kcal > 0
            ? {
                carbPercent: summary.carbPercent,
                proteinPercent: summary.proteinPercent,
                fatPercent: summary.fatPercent,
              }
            : null,
        macrosGram:
          kcal > 0
            ? {
                carb: carbGram,
                protein: proteinGram,
                fat: fatGram,
              }
            : null,
      }));
    }
  }

  // 2) 세 끼 스캔(threeMeals)
  if (mode === 'threeMeals') {
    const keyToLabel = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
    };

    meals = ['breakfast', 'lunch', 'dinner'].map((key) => {
      const whenLabel = keyToLabel[key];
      const data = threeMealsData[key];

      if (!data) {
        return {
          when: whenLabel,
          foodName: '식사를 하지 않았어요.',
          imageUrl: null,
          kcal: null,
          macrosPercent: null,
          macrosGram: null,
        };
      }

      const kcal = data.nutrition?.calorie ?? null;
      const carb = data.nutrition?.carbohydrate ?? null;
      const protein = data.nutrition?.protein ?? null;
      const fat = data.nutrition?.fat ?? null;

      return {
        when: whenLabel,
        foodName: data.detect?.foodName
          ? data.detect.foodName
          : `${whenLabel}에 드신 음식`,
        imageUrl: data.imageUrl || null,
        kcal,
        macrosPercent: null,
        macrosGram:
          carb != null || protein != null || fat != null
            ? {
                carb: carb ?? 0,
                protein: protein ?? 0,
                fat: fat ?? 0,
              }
            : null,
      };
    });

    const totalKcal = meals.reduce(
      (sum, m) => sum + (typeof m.kcal === 'number' ? m.kcal : 0),
      0
    );
    const totalCarb = meals.reduce(
      (sum, m) =>
        sum +
        (m.macrosGram && typeof m.macrosGram.carb === 'number'
          ? m.macrosGram.carb
          : 0),
      0
    );
    const totalProtein = meals.reduce(
      (sum, m) =>
        sum +
        (m.macrosGram && typeof m.macrosGram.protein === 'number'
          ? m.macrosGram.protein
          : 0),
      0
    );
    const totalFat = meals.reduce(
      (sum, m) =>
        sum +
        (m.macrosGram && typeof m.macrosGram.fat === 'number'
          ? m.macrosGram.fat
          : 0),
      0
    );

    summary = {
      ...summary,
      kind: 'gram',
      totalKcal,
      totalCarb,
      totalProtein,
      totalFat,
    };
  }

  // 기본(백엔드 실패 시) 솔루션 문구
  let defaultAiSolution;
  if (summary.kind === 'percent' && summary.totalKcal > 0) {
    defaultAiSolution = `오늘은 총 ${summary.totalKcal.toFixed(
      1
    )}kcal를 섭취하셨네요. 탄수화물 ${summary.carbPercent}%, 단백질 ${
      summary.proteinPercent
    }%, 지방 ${summary.fatPercent}% 비율로 섭취하셨어요. 내일은 단백질 비율을 조금 더 늘려 보는 것을 추천합니다.`;
  } else if (summary.kind === 'gram' && summary.totalKcal > 0) {
    defaultAiSolution = `오늘은 총 ${summary.totalKcal.toFixed(
      1
    )}kcal를 섭취하셨네요. 탄수화물은 약 ${summary.totalCarb.toFixed(
      1
    )}g, 단백질은 약 ${summary.totalProtein.toFixed(
      1
    )}g, 지방은 약 ${summary.totalFat.toFixed(
      1
    )}g 섭취하셨어요. 내일은 부족한 영양소를 보충할 수 있는 식단을 시도해 보세요.`;
  } else {
    defaultAiSolution =
      '오늘 기록된 식사가 없어요. 내일은 한 끼라도 AI와 함께 기록해 볼까요?';
  }

  const nutritionInfo = buildNutritionInfo(mode, meals, summary);

  // AI 솔루션 호출
  useEffect(() => {
    if (!nutritionInfo) return;

    const fetchSolution = async () => {
      try {
        setSolutionLoading(true);
        setSolutionError(null);

        const res = await fetch('http://localhost:8080/solution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nutritionInfo }),
        });

        if (!res.ok) {
          throw new Error('솔루션 API 요청 실패');
        }

        const data = await res.json(); // { solutionInfo: "..." }
        setAiSolution(data.solutionInfo || '');
      } catch (err) {
        console.error(err);
        setSolutionError('AI 솔루션을 불러오는 데 실패했어요.');
      } finally {
        setSolutionLoading(false);
      }
    };

    fetchSolution();
  }, [nutritionInfo]);

  // PDF 저장
  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const marginX = 40;
    const marginY = 40;

    const maxWidth = pdfWidth - marginX * 2;
    const maxHeight = pdfHeight - marginY * 2;

    const widthRatio = maxWidth / canvas.width;
    const heightRatio = maxHeight / canvas.height;
    const scale = Math.min(widthRatio, heightRatio) * 0.98;

    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;

    const x = marginX + (maxWidth - imgWidth) / 2;
    const y = marginY + (maxHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('mymeal_result.pdf');
  };

  return (
    <div className="app-container result-page">
      <div className="hero-wrapper simple-hero">
        <TopHeader onLogoClick={() => navigate('/')} />
      </div>

      <main className="result-main" ref={pdfRef}>
        {/* 1. 요약 카드 */}
        <section className="result-summary-card">
          <div className="result-summary-text">
            <h2>
              오늘 하루 총{' '}
              {summary.totalKcal.toFixed
                ? summary.totalKcal.toFixed(1)
                : summary.totalKcal}
              kcal 먹었어요
            </h2>

            {summary.kind === 'percent' ? (
              <p>
                탄수화물은 {summary.carbPercent}%, 단백질은{' '}
                {summary.proteinPercent}%, 지방은 {summary.fatPercent}%
                비율로 섭취했어요 😌
              </p>
            ) : summary.kind === 'gram' ? (
              <p>
                탄수화물은 약 {summary.totalCarb.toFixed(1)}g, 단백질은 약{' '}
                {summary.totalProtein.toFixed(1)}g, 지방은 약{' '}
                {summary.totalFat.toFixed(1)}g 섭취했어요 😌
              </p>
            ) : (
              <p>아직 기록된 식사가 없어요 😌</p>
            )}
          </div>
          <img
            src="/image/robot4.png"
            alt="요약 로봇"
            className="result-summary-robot"
          />
        </section>

        {/* 2. 끼니별 정보 */}
        <section className="result-meals-section">
          {meals.map((meal) => (
            <div key={meal.when} className="result-meal-row">
              <div className="result-meal-image">
                {meal.imageUrl ? (
                  <img src={meal.imageUrl} alt={meal.foodName} />
                ) : (
                  <img
                    src="/image/robot6.png"
                    alt="식사 정보 없음"
                    className="result-meal-robot"
                  />
                )}
              </div>

              <div className="result-meal-info">
                {/* 왼쪽 텍스트 묶음 */}
                <div className="result-meal-text">
                  <h3>{meal.when}</h3>
                  <p className="result-meal-name">{meal.foodName}</p>

                  {meal.kcal != null ? (
                    <p className="result-meal-kcal">
                      칼로리:{' '}
                      {meal.kcal.toFixed ? meal.kcal.toFixed(1) : meal.kcal}{' '}
                      kcal
                    </p>
                  ) : null}

                  {/* g가 있으면 g 우선, 없으면 퍼센트 */}
                  {meal.macrosGram ? (
                    <p className="result-meal-macros">
                      탄수화물 {meal.macrosGram.carb.toFixed(1)}g / 단백질{' '}
                      {meal.macrosGram.protein.toFixed(1)}g / 지방{' '}
                      {meal.macrosGram.fat.toFixed(1)}g
                    </p>
                  ) : meal.macrosPercent ? (
                    <p className="result-meal-macros">
                      탄수화물 {meal.macrosPercent.carbPercent}% / 단백질{' '}
                      {meal.macrosPercent.proteinPercent}% / 지방{' '}
                      {meal.macrosPercent.fatPercent}%
                    </p>
                  ) : (
                    <p className="result-meal-empty">
                      아직 이 끼니에 대한 영양 정보가 없어요.
                    </p>
                  )}
                </div>

                {/* 오른쪽 도넛 */}
                <div className="result-meal-charts">
                  {meal.macrosGram ? (
                    <MacroDonutChart
                      carb={meal.macrosGram.carb}
                      protein={meal.macrosGram.protein}
                      fat={meal.macrosGram.fat}
                    />
                  ) : meal.macrosPercent ? (
                    <MacroDonutChart
                      carb={meal.macrosPercent.carbPercent}
                      protein={meal.macrosPercent.proteinPercent}
                      fat={meal.macrosPercent.fatPercent}
                    />
                  ) : (
                    <div className="result-chart-placeholder"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 3. AI 건강 솔루션 */}
        <section className="result-solution-section">
          <img
            src="/image/robot5.png"
            alt="AI 솔루션 로봇"
            className="result-solution-robot"
          />
          <div className="result-solution-card">
            <h3>AI 건강 솔루션</h3>
            {solutionLoading ? (
              <p>AI 솔루션을 불러오는 중입니다...</p>
            ) : solutionError ? (
              <p>{solutionError}</p>
            ) : (
              <p>{aiSolution || defaultAiSolution}</p>
            )}
          </div>
        </section>

        {/* 3-1. 책임성과 투명성 안내 */}
        <section className="result-disclaimer-section">
          <p className="result-disclaimer-text">
            칼로리·영양정보는 실제 섭취량·조리법에 따라 달라질 수 있으므로,
            AI 분석 결과를 맹신하지 말고 참고용으로만 사용해 주세요.
          </p>
          <p className="result-disclaimer-text">
            업로드된 이미지는 AI 분석 목적 외 다른 용도로 저장·활용하지 않으며,
            사용자의 동의 없이 제3자에게 제공되지 않습니다.
          </p>
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
