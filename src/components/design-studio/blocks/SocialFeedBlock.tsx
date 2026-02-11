import { useState } from 'react';
import { Twitter, Instagram, Facebook, MessageSquare, Heart, Share2, Globe, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook';
  user: string;
  handle: string;
  avatar: string;
  content: string;
  image?: string;
  date: string;
  likes: string;
}

interface SocialFeedBlockProps {
  brandColor?: string;
  settings?: {
    title?: string;
    hashtag?: string;
    layout?: 'grid' | 'masonry';
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function SocialFeedBlock({
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: SocialFeedBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || "What's Happening";
  const hashtag = settings?.hashtag || '#Eventra2025';

  const mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'twitter',
      user: 'Sarah Jenkins',
      handle: '@sarahj_dev',
      avatar: 'https://i.pravatar.cc/150?u=1',
      content: `Just registered for ${hashtag}! Can't wait to see all the amazing speakers this year. The agenda looks incredible!`,
      date: '2h ago',
      likes: '24'
    },
    {
      id: '2',
      platform: 'instagram',
      user: 'Marcus Thorne',
      handle: '@mthorne_design',
      avatar: 'https://i.pravatar.cc/150?u=2',
      content: 'Getting my workshop materials ready for the big event next month. Who else is going? 🚀',
      image: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=500&q=80',
      date: '5h ago',
      likes: '142'
    },
    {
      id: '3',
      platform: 'twitter',
      user: 'Tech Insider',
      handle: '@tech_insider',
      avatar: 'https://i.pravatar.cc/150?u=3',
      content: 'BREAKING: The full speaker lineup for #Eventra2025 has just been released. It includes some of the biggest names in the industry.',
      date: '8h ago',
      likes: '1.2k'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter size={16} fill="#1DA1F2" color="#1DA1F2" />;
      case 'instagram': return <Instagram size={16} color="#E4405F" />;
      case 'facebook': return <Facebook size={16} fill="#1877F2" color="#1877F2" />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '100px 40px',
        backgroundColor: '#FFFFFF',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Social Feed" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <MessageSquare size={16} />, label: 'Hashtag', onClick: onEdit },
            { icon: <Globe size={16} />, label: 'Connect API', onClick: onEdit }
          ]}
        />
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '64px', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>{title}</h2>
            <p style={{ fontSize: '24px', fontWeight: 800, color: brandColor }}>{hashtag}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              color: brandColor,
              fontWeight: 700,
              fontSize: '15px',
              border: `2px solid ${brandColor}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brandColor + '05'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Join the Conversation
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {mockPosts.map((post) => (
            <div 
              key={post.id}
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid #F3F4F6',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', marginBottom: '20px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <img src={post.avatar} alt={post.user} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.user}</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{post.handle}</p>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>{getPlatformIcon(post.platform)}</div>
              </div>

              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px 0', flex: 1 }}>
                {post.content}
              </p>

              {post.image && (
                <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', aspectRatio: '16/9' }}>
                  <img src={post.image} alt="Post content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', color: '#9CA3AF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    <Heart size={16} />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{post.likes}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = brandColor} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    <MessageSquare size={16} />
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}