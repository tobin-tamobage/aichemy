import React from "react";
import { Navigate } from "react-router-dom";
import { useSite } from "./context";
export function Loading() {
  return (
    <div className="page-loading" role="status">
      <img src="/assets/brand/mark-64.png" width="48" height="48" alt="" />
      <p>Menyiapkan ruang kreasimu…</p>
    </div>
  );
}
export function Protected({
  children,
  paid = false,
  admin = false,
}: {
  children: React.ReactNode;
  paid?: boolean;
  admin?: boolean;
}) {
  const { user, loading } = useSite();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/masuk" replace />;
  if (admin && !user.admin) return <Navigate to="/akun" replace />;
  if (paid && !user.active) return <Navigate to="/checkout" replace />;
  return <>{children}</>;
}
