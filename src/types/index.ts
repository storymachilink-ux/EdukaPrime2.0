export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'comecar' | 'evoluir' | 'tudo-em-um';
  avatar?: string;
}

export interface Activity {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  isCompleted: boolean;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export interface Bonus {
  id: string;
  title: string;
  type: 'pdf' | 'ebook' | 'template';
  description: string;
  downloadUrl: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  cta: string;
}

export interface Educator {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

// Video Sources - Multiple platform support
export type SourceType = 'youtube' | 'wistia' | 'vturb';

export interface YouTubeSourceData {
  video_id: string;
  url: string;
  thumbnail: string;
}

export interface WistiaSourceData {
  media_id: string;
  embed_code: string;
  thumbnail: string;
}

export interface VturbSourceData {
  player_id: string;
  embed_code: string;
  thumbnail: string;
}

export type SourceData = YouTubeSourceData | WistiaSourceData | VturbSourceData;

export interface VideoSource {
  id: string;
  video_id: string;
  source_type: SourceType;
  source_data: SourceData;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoWithSources extends Video {
  sources?: VideoSource[];
  primary_source?: VideoSource;
}