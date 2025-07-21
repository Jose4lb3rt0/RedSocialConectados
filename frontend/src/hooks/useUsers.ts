import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registrarUsuario as registrarUsuarioService } from "../services/UserService"
import { toast } from "sonner"

export function useUsers() {
    const queryClient = useQueryClient()

    const registrarUsuario = useMutation({
        mutationFn: registrarUsuarioService,
        onSuccess: (data) => {
            toast.success("¡Registro completado! Por favor, inicia sesión.")
            // Opcional: invalidar queries si es necesario, por ejemplo, si tengo una lista de usuarios.
            // queryClient.invalidateQueries({ queryKey: ['users'] })
            console.log("Usuario registrado:", data)
        },
        onError: (error: any) => {
            toast.error(error.message || "No se pudo completar el registro.")
            console.error("Error en la mutación de registro:", error)
        }
    })

    return { registrarUsuario }
}
