export interface StudioBlock {
  id: string;
  name: string;
  type: string;
  description: string;
  tier: 'FREE' | 'PRO';
  thumbnail: string;
  icon: any;
}

export interface ActiveStudioBlock extends StudioBlock {
  position: number;
  isVisible: boolean;
  settings?: any;
}
