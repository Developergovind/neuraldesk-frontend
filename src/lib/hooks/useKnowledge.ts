import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, del, postForm } from "@/lib/api";
import toast from "react-hot-toast";

export interface KnowledgeSource {
  id: string;
  botId: string;
  type: 'pdf' | 'docx' | 'txt' | 'url' | 'text';
  name: string;
  status: 'processing' | 'ready' | 'failed';
  errorMessage?: string;
  chunkCount: number;
  createdAt: string;
}

export function useKnowledge(botId: string) {
  return useQuery<KnowledgeSource[]>({
    queryKey: ["knowledge", botId],
    queryFn: () => get(`/knowledge/${botId}`),
    enabled: !!botId,
  });
}

export function useUploadFile(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return postForm(`/knowledge/${botId}/upload`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", botId] });
      toast.success("File uploaded and processing started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "File upload failed");
    },
  });
}

export function useIngestUrl(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => post(`/knowledge/${botId}/url`, { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", botId] });
      toast.success("URL ingestion started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "URL ingestion failed");
    },
  });
}


export function useIngestText(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; text: string }) => post(`/knowledge/${botId}/text`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", botId] });
      toast.success("Text ingestion started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Text ingestion failed");
    },
  });
}


export function useDeleteSource(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => del(`/knowledge/${botId}/${sourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", botId] });
      toast.success("Knowledge source deleted");
    },
  });
}
