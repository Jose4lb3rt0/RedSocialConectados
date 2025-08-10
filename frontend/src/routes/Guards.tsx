import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export const RequireAuth: React.FC = () => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export const RequireGuest: React.FC = () => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}