import { Route, Routes } from "react-router-dom"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import VerifyAccountPage from "../pages/VerifyAccountPage"
import CheckEmailPage from "../pages/CheckEmailPage"
import { RequireAuth, RequireGuest } from "./Guards"
import ProfilePage from "../pages/ProfilePage"
import Layout from "../components/Navigation/Layout"
import FriendsPage from "@/pages/FriendsPage"

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/verify-account" element={<VerifyAccountPage />} />
            <Route path="/u/:slug" element={<Layout><ProfilePage /></Layout>} />

            <Route element={<RequireGuest />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
                {/* <Route path="/profile" element={<Layout><ProfilePage /></Layout>} /> */}
                <Route path="/friends" element={<Layout><FriendsPage /></Layout>} />
            </Route>
        </Routes>
    )
}

export default AppRoutes