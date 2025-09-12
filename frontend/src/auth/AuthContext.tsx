import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiFetch } from "../api/apibase"
import type { UserProfile } from "@/services/UserService"

type User = {
    id: number,
    email: string,
    name: string,
    surname: string,
    photoURL?: string,
    string: string,
}

type AuthContextType = {
    user: UserProfile /* User */ | null
    token: string | null,
    isAuthenticated: boolean,
    login: (token: string) => Promise<void>,
    logout: () => void,
    refreshMe: () => Promise<void>,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwt"))
    const [user, setUser] = useState<UserProfile | null>(null)

    const isAuthenticated = !!token

    useEffect(() => {
        if (!token) { setUser(null); return }
        refreshMe().catch(() => logout())

        const onStorage = (e: StorageEvent) => {
            if (e.key === "jwt") {
                setToken(localStorage.getItem("jwt"))
            }

            window.addEventListener("storage", onStorage)
            return (() => window.removeEventListener("storage", onStorage))
        }
    }, [token])

    useEffect(() => {
        const h = () => logout()
        window.addEventListener("auth:unauthorized", h)
        return () => window.removeEventListener("auth:unauthorized", h)
    }, [])

    async function refreshMe() {
        const me = await apiFetch("/users/me", {
            method: "GET",
        })
        setUser(me)
    }

    async function login(token: string) {
        localStorage.setItem("jwt", token)
        setToken(token)
        await refreshMe()
    }

    async function logout() {
        localStorage.removeItem("jwt")
        setToken(null)
        setUser(null)
    }

    const value = useMemo(() => ({ user, token, isAuthenticated, login, logout, refreshMe }), [user, token, isAuthenticated])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider")
    }
    return contexto
}
