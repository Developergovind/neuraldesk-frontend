import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/overview");
      return data;
    },
  });
}
