import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, post, get } from "@/lib/api";
import { saveTokens, clearTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: any) => post("/auth/login", data),
    onSuccess: (data: any) => {
      saveTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("tenant", JSON.stringify(data.tenant));
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: any) => post("/auth/register", data),
    onSuccess: () => {
      toast.success("Account created! Please sign in.");
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    clearTokens();
    queryClient.clear();
    router.push("/");
    toast.success("Logged out");
  };
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => get("/auth/me"),
    retry: false,
  });
}
