import logoImage from 'figma:asset/94f73fab6da4553dd701cee9de841d39c5760ca0.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: { height: 24, width: 'auto' },
    md: { height: 32, width: 'auto' },
    lg: { height: 48, width: 'auto' }
  };

  const dimensions = sizeMap[size];

  return (
    <img 
      src={logoImage} 
      alt="Eventra Logo" 
      style={{ 
        height: `${dimensions.height}px`,
        width: dimensions.width,
        objectFit: 'contain'
      }}
      className={`transition-opacity hover:opacity-90 ${className}`}
    />
  );
}
