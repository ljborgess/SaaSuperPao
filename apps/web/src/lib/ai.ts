import { api } from './api'
import type { ChatMessage, ChatResponse, AiProvider } from '@superpao/shared-types'

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  provider: AiProvider,
  apiKey: string,
  model?: string,
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/api/ai/chat', { message, history, provider, apiKey, model })
  return data
}
