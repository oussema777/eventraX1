import { Facebook, Twitter, Linkedin, MessageCircle, Mail } from 'lucide-react';

export default function SocialShareSection() {
  const socialButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      bgColor: '#1877F2',
      color: 'white'
    },
    {
      name: 'X',
      icon: Twitter,
      bgColor: '#000000',
      color: 'white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      bgColor: '#0A66C2',
      color: 'white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: '#25D366',
      color: 'white'
    },
    {
      name: 'Email',
      icon: Mail,
      bgColor: '#E5E7EB',
      color: '#0B2641'
    }
  ];

  return (
    <div className="w-full mt-12">
      <h3 
        className="text-xl mb-6 text-center"
        style={{ fontWeight: 600, color: '#FFFFFF' }}
      >
        Share on Social Media
      </h3>

      <div className="flex items-center justify-center gap-4">
        {socialButtons.map((button) => {
          const Icon = button.icon;
          
          return (
            <button
              key={button.name}
              className="h-[52px] px-6 rounded-lg flex items-center gap-2 transition-transform hover:scale-105"
              style={{
                backgroundColor: button.bgColor,
                color: button.color,
                fontWeight: 600
              }}
            >
              <Icon size={20} />
              <span>{button.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}