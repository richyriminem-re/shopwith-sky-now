import React from 'react';

interface WatermarkProps {
  className?: string;
}

export const Watermark: React.FC<WatermarkProps> = ({ className = "" }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute opacity-[0.05] dark:opacity-[0.035]"
        style={{
          top: 'calc(-1 * clamp(200px, 24vw, 300px))',
          left: 'calc(-1 * clamp(200px, 24vw, 300px))',
          right: 'calc(-1 * clamp(200px, 24vw, 300px))',
          bottom: 'calc(-1 * clamp(200px, 24vw, 300px))',
          backgroundImage: 'url("/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png")',
          backgroundSize: 'clamp(120px, 16vw, 200px) auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0, calc(clamp(200px, 24vw, 300px) * 0.5) calc(clamp(200px, 24vw, 300px) * 0.5)',
          transform: 'rotate(45deg) scale(1.4)',
          transformOrigin: 'center',
          filter: 'grayscale(0.2) contrast(0.8)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Dark mode variant with screen blend mode */}
      <div
        className="absolute opacity-[0.035] dark:opacity-[0.025] dark:block hidden"
        style={{
          top: 'calc(-1 * clamp(200px, 24vw, 300px))',
          left: 'calc(-1 * clamp(200px, 24vw, 300px))',
          right: 'calc(-1 * clamp(200px, 24vw, 300px))',
          bottom: 'calc(-1 * clamp(200px, 24vw, 300px))',
          backgroundImage: 'url("/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png")',
          backgroundSize: 'clamp(120px, 16vw, 200px) auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0, calc(clamp(200px, 24vw, 300px) * 0.5) calc(clamp(200px, 24vw, 300px) * 0.5)',
          transform: 'rotate(45deg) scale(1.4)',
          transformOrigin: 'center',
          filter: 'grayscale(0.4) contrast(0.6) invert(0.1)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};