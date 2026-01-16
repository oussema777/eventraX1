export default function DraftSavedMessage() {
  return (
    <div className="text-center">
      <h1 
        className="text-4xl mb-4"
        style={{ fontWeight: 700, color: 'var(--foreground)' }}
      >
        Draft Saved Successfully!
      </h1>
      <p 
        className="text-lg mb-2"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Your event has been saved as a draft.
      </p>
      <p 
        className="text-base"
        style={{ color: 'var(--muted-foreground)' }}
      >
        You can continue editing it anytime from your dashboard.
      </p>

      {/* Auto-redirect notice */}
      <div 
        className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full"
        style={{ backgroundColor: 'var(--primary-light)' }}
      >
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <span 
          className="text-sm"
          style={{ color: 'var(--primary)', fontWeight: 500 }}
        >
          Redirecting to dashboard...
        </span>
      </div>
    </div>
  );
}
