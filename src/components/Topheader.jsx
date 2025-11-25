import React from 'react';

export default function TopHeader({ onLogoClick }) {
  return (
    <header className="top-header-container">
      <div className="top-header-inner">
        <button className="logo-button" onClick={onLogoClick}>
          한끼스캔 <span>(MyMeal Scanner)</span>
        </button>
      </div>
    </header>
  );
}