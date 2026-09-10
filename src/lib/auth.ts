import Cookies from "js-cookie";
import { isDisposableEmail } from "./disposableEmail";

export const saveTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set("accessToken", accessToken, { secure: true, sameSite: "strict" });
  Cookies.set("refreshToken", refreshToken, { secure: true, sameSite: "strict", expires: 7 });
};

export const getAccessToken = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");

export const clearTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("tenant");
  localStorage.removeItem("tenant");
  if (typeof window !== "undefined") {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("neuraldesk_bot_chats_") || key.startsWith("neuraldesk_active_chat_")) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const isAuthenticated = () => {
  const tenant = getTenant();
  return !!getAccessToken() && !!tenant && !isDisposableEmail(tenant.email);
};

export const getTenant = () => {
  if (typeof window === "undefined") return null;
  const tenantStr = localStorage.getItem("tenant");
  if (!tenantStr) return null;
  try {
    const tenant = JSON.parse(tenantStr);
    if (tenant?.email && isDisposableEmail(tenant.email)) {
      clearTokens();
      return null;
    }
    return tenant;
  } catch {
    return null;
  }
};
