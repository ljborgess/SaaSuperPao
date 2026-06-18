import { api } from './api'
import type { ChatMessage, ChatResponse } from '@superpao/shared-types'

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/api/ai/chat', { message, history })
  return data
}
