export default function SuccessHeader() {
  return (
    <div className="text-center mb-8">
      <h1 
        className="text-5xl mb-4"
        style={{ fontWeight: 700, color: '#FFFFFF' }}
      >
        🎉 Your Event is Live!
      </h1>
      <p 
        className="text-lg"
        style={{ color: 'rgba(255, 255, 255, 0.8)' }}
      >
        SaaS Summit 2024 is now published and ready for registrations
      </p>
      
      {/* Divider */}
      <div className="flex justify-center mt-8">
        <div 
          className="w-15 h-1 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>
    </div>
  );
}