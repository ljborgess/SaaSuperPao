export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  history: ChatMessage[]
}

export interface ChatResponse {
  message: string
  timestamp: string
}
