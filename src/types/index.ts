// Add missing Page and StaffPage types
export type Page =
  | "login"
  | "signup"
  | "dashboard"
  | "profile"
  | "report"
  | "staff"
  | "chatbot"
  | "incidents";
export type StaffPage =
  | "dashboard"
  | "staff-dashboard"
  | "incidents"
  | "staff-incidents"
  | "knowledgebase"
  | "staff-knowledge"
  | "settings"
  | "users";
//types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "resident" | "staff" | "admin";
  createdAt?: string;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  confidence?: number;
}

export interface Citation {
  title: string;
  snippet: string;
  sourceLink?: string;
  docId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
  userId: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  submittedOn: string;
  lastUpdated: string;
  contactInfo?: string;
  userId: string;
  assignedTo?: string;
  photos?: string[];
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  sourceUrl?: string;
}
