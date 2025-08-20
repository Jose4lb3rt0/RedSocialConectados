import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    iniciarSesion as iniciarSesionService,
    registrarUsuario as registrarUsuarioService,
    verificarCuenta as verificarCuentaService,
    actualizarPerfil as actualizarPerfilService
} from "../services/UserService"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

function getErrorMessage(error: any) {
    return error?.message ||
        error?.data?.message ||
        error?.data?.error ||
        "No se pudo completar el registro."
}

export function useUsers() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { login } = useAuth()

    const iniciarSesion = useMutation({
        mutationFn: iniciarSesionService,
        onSuccess: (data: any) => {
            loginAutenticacion(data)
        },
        onError: (error: any) => {
            toast.error(getErrorMessage(error))
        }
    })

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

    async function loginAutenticacion(data: any) {
        if (data?.token) {
            await login(data.token)
        }
        navigate("/", { state: { message: data?.message || "¡Bienvenido!" } })
    }

    const actualizarPerfil = useMutation({
        mutationFn: actualizarPerfilService,
        onSuccess: (data: any) => {
            toast.success(data?.message || "Perfil actualizado.")
            // Refresca la caché del perfil
            queryClient.invalidateQueries({ queryKey: ["profile"] })
        },
        onError: (e) => toast.error(getErrorMessage(e))
    })

    return { 
        registrarUsuario, 
        verificarCuenta, 
        iniciarSesion, 
        actualizarPerfil 
    }
}
