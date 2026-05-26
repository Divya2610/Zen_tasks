export const normalizeRole = (user) => {
  const rawRole = String(user?.role || "").trim().toLowerCase();

  if (user?.isAdmin === true || rawRole === "admin") return "admin";
  if (rawRole === "team_member" || rawRole === "team member") return "member";

  return rawRole || "member";
};

export const isAdminUser = (user) => normalizeRole(user) === "admin";
