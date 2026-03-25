export interface Order {
  id: string;
  projectName: string;
  overview: string;
  techRequirements?: string;
  contactEmail: string;
  contactName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  duration: string;
  status: "completed" | "in-progress";
  highlight?: string;
  url?: string;
  outcome?: string; // 導入効果・ROI（例: "問い合わせ3倍"）
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}
