import { apiFetch } from "../api/apibase"
import type { RegisterFormData } from "../schemas/userSchemas"

export async function registrarUsuario(data: RegisterFormData) {
    try {
        const { confirmPassword, birthday, ...restOfData } = data

        // esta en formato YYYY-MM-DD
        const date = new Date(birthday)

        const userData = {
            ...restOfData,
            dayOfBirth: date.getUTCDate(),
            monthOfBirth: date.getUTCMonth() + 1, // getUTCMonth() es 0-indexado
            yearOfBirth: date.getUTCFullYear(),
        }

        const response = await apiFetch("/auth/registro", {
            method: "POST",
            body: JSON.stringify(userData),
        })
        return response
    } catch (error: any) {
        console.error("Error al registrar usuario:", error)
        throw error
    }
}

export async function iniciarSesion(payload: { email: string, password: string }) {
    try {
        const response = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload)
        })
        return response
    } catch (error) {
        console.error("Error al iniciar sesión:", error)
        throw error
    }
}

export async function verificarCuenta(token: string) {
    try {
        const response = await apiFetch(`/auth/verify?token=${token}`, {
            method: "POST",
        })
        return response
    } catch (error: any) {
        console.error("Error al verificar la cuenta:", error)
        throw error
    }
}