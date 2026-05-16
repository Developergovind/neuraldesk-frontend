import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import toast from "react-hot-toast";

export interface Bot {
  id: string;
  name: string;
  greeting: string;
  persona: string;
  accentColor: string;
  avatarUrl?: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

export function useBots() {
  return useQuery<Bot[]>({
    queryKey: ["bots"],
    queryFn: () => get("/bots"),
  });
}

export function useBot(id: string) {
  return useQuery<Bot>({
    queryKey: ["bots", id],
    queryFn: () => get(`/bots/${id}`),
    enabled: !!id,
  });
}

export function useCreateBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post("/bots", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create bot");
    },
  });
}

export function useUpdateBot(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => patch(`/bots/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", id] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot updated!");
    },
  });
}

export function useDeleteBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/bots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot deleted");
    },
  });
}

export function useBotStats(id: string) {
  return useQuery({
    queryKey: ["bots", id, "stats"],
    queryFn: () => get(`/bots/${id}/stats`),
    enabled: !!id,
  });
}
