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