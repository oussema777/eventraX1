interface WizardHeaderProps {
  title: string;
  subtitle: string;
}

export default function WizardHeader({ title, subtitle }: WizardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 
        className="text-4xl mb-2"
        style={{ fontWeight: 600, color: 'var(--foreground)' }}
      >
        {title}
      </h1>
      <p 
        className="text-base mb-6"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {subtitle}
      </p>
      <div 
        className="w-full h-px"
        style={{ backgroundColor: 'var(--border)' }}
      />
    </div>
  );
}
