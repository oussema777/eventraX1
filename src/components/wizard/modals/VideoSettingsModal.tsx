import { useState, useEffect } from 'react';
import { X, Video, Upload, Crown } from 'lucide-react';

export interface VideoSettingsData {
  videoUrl: string;
  videoTitle: string;
  videoDescription: string;
}

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VideoSettingsData) => void;
  initialData: VideoSettingsData;
  hasPro: boolean;
}

export default function VideoSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  hasPro
}: VideoSettingsModalProps) {
  const [videoUrl, setVideoUrl] = useState(initialData.videoUrl);
  const [pastedUrl, setPastedUrl] = useState('');
  const [autoplay, setAutoplay] = useState(true);
  const [loop, setLoop] = useState(true);
  const [mute, setMute] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showTextOverlay, setShowTextOverlay] = useState(true);
  const [headlineText, setHeadlineText] = useState('SaaS Summit 2024');
  const [subtitleText, setSubtitleText] = useState('Join us for innovation');
  const [overlayDarkness, setOverlayDarkness] = useState(50);

  useEffect(() => {
    if (isOpen) {
      setVideoUrl(initialData.videoUrl);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      videoUrl,
      videoTitle: headlineText,
      videoDescription: subtitleText
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: '600px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center gap-3">
            <h2
              className="text-xl"
              style={{ fontWeight: 600, color: '#0B2641' }}
            >
              Hero Video Settings
            </h2>
            <span
              className="px-2 py-1 rounded text-xs flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                fontWeight: 700
              }}
            >
              <Crown size={12} />
              PRO
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
          >
            <X size={20} style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 180px)' }}
        >
          {/* Video Upload */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 500, color: '#0B2641' }}
            >
              Upload Video
            </label>
            <div
              className="relative border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-solid"
              style={{
                borderColor: videoUrl ? '#10B981' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                height: '200px'
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setVideoUrl(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {videoUrl ? (
                  <div className="text-center">
                    <Video size={48} style={{ color: '#10B981', marginBottom: '12px' }} className="mx-auto" />
                    <span className="text-sm" style={{ color: '#10B981', fontWeight: 600 }}>
                      Video uploaded successfully
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} style={{ color: '#6B7280', marginBottom: '12px' }} />
                    <span className="text-sm" style={{ color: '#0B2641' }}>
                      Upload video file or paste URL
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      Supported: MP4, WebM, YouTube, Vimeo
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 500, color: '#0B2641' }}
            >
              Or paste video URL
            </label>
            <input
              type="text"
              value={pastedUrl}
              onChange={(e) => {
                setPastedUrl(e.target.value);
                setVideoUrl(e.target.value);
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full h-11 px-4 rounded-lg border outline-none transition-colors"
              style={{
                borderColor: '#E5E7EB',
                color: '#0B2641'
              }}
            />
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
              YouTube and Vimeo links supported
            </p>
          </div>

          {/* Playback Settings */}
          <div>
            <label
              className="block text-sm mb-3"
              style={{ fontWeight: 500, color: '#0B2641' }}
            >
              Playback Settings
            </label>
            <div className="space-y-3">
              {[
                { label: 'Autoplay video', state: autoplay, setState: setAutoplay },
                { label: 'Loop video', state: loop, setState: setLoop },
                { label: 'Mute by default', state: mute, setState: setMute },
                { label: 'Show video controls', state: showControls, setState: setShowControls }
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#0B2641' }}>
                    {setting.label}
                  </span>
                  <button
                    onClick={() => setting.setState(!setting.state)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: setting.state ? '#0684F5' : '#E5E7EB'
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{
                        left: setting.state ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay Settings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label
                className="block text-sm"
                style={{ fontWeight: 500, color: '#0B2641' }}
              >
                Text Overlay
              </label>
              <button
                onClick={() => setShowTextOverlay(!showTextOverlay)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: showTextOverlay ? '#0684F5' : '#E5E7EB'
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{
                    left: showTextOverlay ? 'calc(100% - 22px)' : '2px'
                  }}
                />
              </button>
            </div>

            {showTextOverlay && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="Event title"
                    className="w-full h-10 px-3 rounded-lg border outline-none"
                    style={{
                      borderColor: '#E5E7EB',
                      color: '#0B2641'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder="Tagline"
                    className="w-full h-10 px-3 rounded-lg border outline-none"
                    style={{
                      borderColor: '#E5E7EB',
                      color: '#0B2641'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                    Overlay Darkness ({overlayDarkness}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayDarkness}
                    onChange={(e) => setOverlayDarkness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: '#E5E7EB' }}
        >
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-lg transition-colors"
            style={{
              color: '#6B7280',
              backgroundColor: 'transparent',
              border: '1px solid #E5E7EB'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 h-11 rounded-lg transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              fontWeight: 600
            }}
          >
            Apply Video
          </button>
        </div>
      </div>
    </div>
  );
}
