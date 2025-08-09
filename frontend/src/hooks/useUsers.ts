import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registrarUsuario as registrarUsuarioService, verificarCuenta as verificarCuentaService } from "../services/UserService"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

function getErrorMessage(error: any) {
    return error?.message ||
        error?.data?.message ||
        error?.data?.error ||
        "No se pudo completar el registro."
}

export function useUsers() {
    // const queryClient = useQueryClient()
    const navigate = useNavigate()

    const registrarUsuario = useMutation({
        mutationFn: registrarUsuarioService,
        onSuccess: (data: any) => {
            // navigate("/check-email", { state: { message: data?.message || "Te enviamos un enlace de verificación a tu correo." } })
            loginAutenticacion(data)
        },
        onError: (error: any) => {
            toast.error(getErrorMessage(error))
        }
    })

    const verificarCuenta = useMutation({
        mutationFn: verificarCuentaService,
        onSuccess: (data) => {
            toast.success(data.message || "¡Cuenta verificada con éxito! Ya puedes iniciar sesión.")
            navigate('/login')
        },
        onError: (error: any) => {
            toast.error(error.message || "No se pudo verificar la cuenta.")
        }
    })

    function loginAutenticacion(data: any) {
        if (data?.token) {
            localStorage.setItem("jwt", data.token)
        }
        navigate("/", { state: { message: data?.message || "¡Bienvenido!" } })
    }

    return { registrarUsuario, verificarCuenta }
}
