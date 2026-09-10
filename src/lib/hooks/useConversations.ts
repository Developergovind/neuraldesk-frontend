import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

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

export function useDeleteConversation(botId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      try {
        const { data } = await api.delete(`/bots/${botId}/conversations/${sessionId}`)
        return data
      } catch (err: any) {
        // Resilient fallback for alternative route configurations
        try {
          const { data } = await api.delete(`/chat/session/${sessionId}`)
          return data
        } catch (fallbackErr) {
          const { data } = await api.delete(`/bots/${botId}/sessions/${sessionId}`)
          return data
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-conversations', botId] })
      queryClient.invalidateQueries({ queryKey: ['bot-conv-stats', botId] })
      queryClient.invalidateQueries({ queryKey: ['conversation-thread', botId] })
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['usage-over-time'] })
      toast.success('Conversation deleted')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete conversation')
    },
  })
}

export function useClearAllConversations(botId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.delete(`/bots/${botId}/conversations`)
        return data
      } catch (err: any) {
        const { data } = await api.delete(`/bots/${botId}/conversations/clear`)
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-conversations', botId] })
      queryClient.invalidateQueries({ queryKey: ['bot-conv-stats', botId] })
      queryClient.invalidateQueries({ queryKey: ['conversation-thread', botId] })
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['usage-over-time'] })
      toast.success('All conversations cleared')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to clear conversations')
    },
  })
}

