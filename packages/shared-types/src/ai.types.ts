export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type AiProvider = 'groq' | 'openai' | 'anthropic'

export interface ChatRequest {
  message: string
  history: ChatMessage[]
  provider?: AiProvider
  apiKey?: string
  model?: string
}

export interface ChatResponse {
  message: string
  timestamp: string
}
