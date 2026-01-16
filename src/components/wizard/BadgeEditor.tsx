import { useState } from 'react';
import BadgeElementsSidebar from './BadgeElementsSidebar';
import BadgeCanvas from './BadgeCanvas';
import BadgePropertiesPanel from './BadgePropertiesPanel';
import BadgeOptions from './BadgeOptions';

export default function BadgeEditor() {
  const [selectedElement, setSelectedElement] = useState<string>('qrcode');
  const [badgeOrientation, setBadgeOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [badgeSize, setBadgeSize] = useState('4x3');

  return (
    <div className="space-y-6">
      {/* Responsive Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* Center Canvas - Shows first on Mobile */}
        <div className="order-1 lg:order-2 lg:col-span-6">
          <BadgeCanvas 
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            orientation={badgeOrientation}
          />
        </div>

        {/* Left Sidebar - Elements - Shows second on Mobile */}
        <div className="order-2 lg:order-1 lg:col-span-3">
          <BadgeElementsSidebar />
        </div>

        {/* Right Panel - Properties - Shows last on Mobile */}
        <div className="order-3 lg:order-3 lg:col-span-3">
          <BadgePropertiesPanel selectedElement={selectedElement} />
        </div>
      </div>

      {/* Additional Options */}
      <BadgeOptions 
        badgeOrientation={badgeOrientation}
        setBadgeOrientation={setBadgeOrientation}
        badgeSize={badgeSize}
        setBadgeSize={setBadgeSize}
      />
    </div>
  );
}
