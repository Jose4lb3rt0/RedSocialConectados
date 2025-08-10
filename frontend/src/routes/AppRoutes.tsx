import { Route, Routes } from "react-router-dom"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import VerifyAccountPage from "../pages/VerifyAccountPage"
import CheckEmailPage from "../pages/CheckEmailPage"
import { RequireAuth, RequireGuest } from "./Guards"

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/verify-account" element={<VerifyAccountPage />} />

            <Route element={<RequireGuest />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
                <Route path="/feed" element={<div>Mi feed</div>} />
                <Route path="/profile" element={<div>Perfil</div>} />
            </Route>
        </Routes>
    )
}

export default AppRoutes