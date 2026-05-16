import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useConversations(botId: string, page = 1, search = '') {
  return useQuery({
    queryKey: ['bot-conversations', botId, page, search],
    queryFn: async () => {
      const { data } = await api.get(`/bots/${botId}/conversations`, {
        params: { page, limit: 20, ...(search && { search }) }
      })
      return data
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,  // 30 seconds
  })
}

export function useConversationThread(botId: string, sessionId: string | null) {
  return useQuery({
    queryKey: ['conversation-thread', botId, sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/bots/${botId}/conversations/${sessionId}`)
      return data
    },
    enabled: !!sessionId,
    staleTime: 60_000,
  })
}

export function useConversationStats(botId: string) {
  return useQuery({
    queryKey: ['bot-conv-stats', botId],
    queryFn: async () => {
      const { data } = await api.get(`/bots/${botId}/conversations/stats`)
      return data
    },
    staleTime: 60_000,
  })
}
