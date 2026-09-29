declare module '@slider-captcha/react' {
  import React from 'react';

  export interface SliderCaptchaProps {
    create?: string | (() => Promise<{ background: unknown; slider: unknown }>);
    verify?: string | ((response: number, trail: { x: number[]; y: number[] }) => Promise<{ result: string; token?: string }>);
    callback?: (token: string) => void;
    variant?: 'light' | 'dark';
    text?: {
      anchor?: string;
      challenge?: string;
    };
  }

  const SliderCaptcha: React.FC<SliderCaptchaProps>;
  export default SliderCaptcha;
}
