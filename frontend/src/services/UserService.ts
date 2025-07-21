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
    } catch(error: any) {
        console.error("Error al registrar usuario:", error)
        throw error
    }
}