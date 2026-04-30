export const getUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("erp-user") || "null");
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("erp-token");
  localStorage.removeItem("erp-refresh");
  localStorage.removeItem("re_user");

  window.location.href = "/login";
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("erp-token");
};