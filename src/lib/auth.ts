import Cookies from "js-cookie";
import { isDisposableEmail } from "./disposableEmail";

const isHttps = () => typeof window !== "undefined" && window.location.protocol === "https:";

export const saveTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set("accessToken", accessToken, { secure: isHttps(), sameSite: "lax", expires: 7 });
  Cookies.set("refreshToken", refreshToken, { secure: isHttps(), sameSite: "lax", expires: 7 });
};


export const getAccessToken = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");

export const clearTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("tenant");
  if (typeof window !== "undefined") {
    localStorage.removeItem("tenant");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("neuraldesk_bot_chats_") || key.startsWith("neuraldesk_active_chat_")) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const isAuthenticated = () => {
  const tenant = getTenant();
  return (!!getAccessToken() || !!getRefreshToken()) && !!tenant;
};

export const getTenant = () => {
  if (typeof window === "undefined") return null;
  const cookieTenant = Cookies.get("tenant");
  const localTenant = localStorage.getItem("tenant");
  const tenantStr = cookieTenant || localTenant;
  if (!tenantStr) return null;
  try {
    const tenant = JSON.parse(tenantStr);
    return tenant;
  } catch {
    return null;
  }
};


