import Cookies from "js-cookie";

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
};

export const isAuthenticated = () => !!getAccessToken();

export const getTenant = () => {
  if (typeof window === "undefined") return null;
  const tenant = localStorage.getItem("tenant");
  return tenant ? JSON.parse(tenant) : null;
};
