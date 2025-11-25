import React from 'react';
import TopHeader from '../components/Topheader';


// 파노라마 슬라이더용
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

// 라우팅용 (Upload Now 누르면 다음 페이지로)
import { useNavigate } from 'react-router-dom';

// 스타일
import '../App.css';

export default function LandingPage() {
  const navigate = useNavigate();

  // 음식 이미지들
  const foodImages = Array.from(
    { length: 11 },
    (_, i) => `/image/Rectangle ${i + 1}.png`
  );

  return (
    <div className="app-container">
      {/* 상단 초록색 영역 (헤더 + 히어로) */}
      <div className="hero-wrapper">
            <TopHeader onLogoClick={() => navigate('/')} />

        

        {/* 메인 히어로 */}
        <section className="hero-section">
          <div className="text-content">
            <h1 className="paytone-title">
                Snap, Check, Eat.
                </h1>
            <p>먹기 전에 찍기만 하세요. 복잡한 칼로리 계산은 AI가 대신해 드립니다.</p>
            <button
              className="upload-btn"
              onClick={() => navigate('/scan-mode')} 
            >
              Upload Now →
            </button>
          </div>

          <div className="robot-container">
            <img src="/image/robot1.png" alt="AI Robot" className="robot-img" />
          </div>
        </section>
      </div>

      {/* 슬라이드 영역 */}
      <section className="slider-section">
        <h2>스마트한 식단 관리, 사진 한 장으로 시작하세요.</h2>
        <p className="slider-subtitle">
          식사 전 1초만 투자하세요. 나머지는 인공지능이 알아서 분석하고 기록합니다.
        </p>
        
        <div className="food-strip-wrapper">
            <Swiper
            className="food-strip"
            loop={true}
            centeredSlides={true}
            slidesPerView={6}
            spaceBetween={20}
            autoplay={{
                delay: 2000,
                disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            >
            {foodImages.map((src, index) => (
                <SwiperSlide key={index}>
                <img src={src} alt={`food-${index}`} />
                </SwiperSlide>
            ))}
            </Swiper>
        </div>
        </section>

      {/* 본문 소개 */}
      <section className="description-section">
        <p>
          우리는 매일 '무엇을 먹을까' 고민하지만, 정작 '무엇을 먹었는지'는 쉽게 잊어버리곤 합니다.
          <br />
          건강한 몸을 만들기 위해서는 운동만큼이나 정확한 영양 섭취가 중요합니다.
          <br />
          하지만 매 끼니 음식의 무게를 재고, 칼로리 표를 검색하여 기록하는 일은 누구에게나 번거롭고
          <br />
          지속하기 어려운 과정이었습니다.
        </p>

        <p>
          한끼스캔은 이러한 불편함을 기술로 해결하고자 합니다.
        </p>

        <p>
          셔터를 누르는 단 1초의 행동만으로, 당신의 접시 위에 담긴 영양 정보를 분석하고 시각화합니다.
          <br />
          복잡한 계산은 인공지능에게 맡기세요.
          <br />
          당신은 그저 맛있는 식사를 즐기고, 한끼스캔이 제공하는 데이터를 통해 더 나은 내일의 식단을
          계획하기만 
          <br />하면 됩니다. 균형 잡힌 삶을 위한 가장 스마트한 파트너, 한끼스캔이 함께하겠습니다.
        </p>
      </section>
    </div>
  );
}
