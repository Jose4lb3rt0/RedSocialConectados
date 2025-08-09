import { Route, Routes } from "react-router-dom"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import VerifyAccountPage from "../pages/VerifyAccountPage"
import CheckEmailPage from "../pages/CheckEmailPage"

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} /> {/* Ruta de aviso de que se envió un correo electrónico */}
            <Route path="/verify-account" element={<VerifyAccountPage />} /> {/* Ruta para verificar la cuenta */}
        </Routes>
    )
}

export default AppRoutes