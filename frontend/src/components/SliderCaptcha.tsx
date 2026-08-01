import React, { useState } from 'react';

interface SliderCaptchaProps {
  onSuccess: () => void;
}

export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ onSuccess }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isVerified) return;
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    if (value === 100) {
      setIsVerified(true);
      onSuccess();
    }
  };

  const handleMouseUp = () => {
    if (!isVerified) {
      setSliderValue(0);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '40px',
      background: isVerified ? 'var(--rcsc-success-light, #d2f4ef)' : 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: `${sliderValue}%`,
        background: isVerified ? 'var(--rcsc-success, #52ccba)' : 'var(--primary-light, #3498db)',
        opacity: 0.3,
        pointerEvents: 'none'
      }}></div>
      
      <span style={{ 
        position: 'absolute', 
        zIndex: 1, 
        color: isVerified ? '#fff' : 'var(--text-secondary)',
        fontSize: '0.9rem',
        pointerEvents: 'none'
      }}>
        {isVerified ? 'Verified' : 'Slide to verify'}
      </span>

      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderValue} 
        onChange={handleSliderChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        disabled={isVerified}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          width: '100%',
          height: '100%',
          background: 'transparent',
          outline: 'none',
          zIndex: 2,
          margin: 0,
          cursor: isVerified ? 'default' : 'pointer'
        }}
        className="slider-captcha-input"
      />
      <style>
        {`
          .slider-captcha-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 40px;
            height: 40px;
            background: #fff;
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .slider-captcha-input::-moz-range-thumb {
            width: 40px;
            height: 40px;
            background: #fff;
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        `}
      </style>
    </div>
  );
};
