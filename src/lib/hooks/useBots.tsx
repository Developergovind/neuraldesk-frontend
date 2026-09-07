import React from "react";
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
      queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
      toast.success("Bot created successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "";
      const isLimitError = 
        err.response?.status === 403 || 
        msg.toLowerCase().includes("limit") || 
        msg.toLowerCase().includes("upgrade") || 
        msg.toLowerCase().includes("plan");

      if (isLimitError) {
        toast((t) => (
          <div className="flex flex-col gap-2 p-1">
            <span className="font-semibold text-white">Bot limit reached!</span>
            <span className="text-xs text-white/70">Upgrade your subscription to create more assistants.</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (typeof window !== "undefined") {
                  window.location.href = "/dashboard/settings?tab=billing";
                }
              }}
              className="mt-1 px-3 py-1.5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow transition-all text-center"
            >
              Upgrade Subscription
            </button>
          </div>
        ), { duration: 6000 });
      } else {
        toast.error(msg || "Failed to create bot");
      }
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
      queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
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
