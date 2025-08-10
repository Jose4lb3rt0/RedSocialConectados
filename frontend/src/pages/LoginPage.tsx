import { useForm } from "react-hook-form"
import { useUsers } from "../hooks/useUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "../schemas/userSchemas"

const LoginPage: React.FC = () => {
    const { iniciarSesion } = useUsers()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginFormData) => {
        iniciarSesion.mutate(data)
    }

    return (
        <div className="p-8 min-h-screen w-full">
            {iniciarSesion.isError && (
                <p className="mb-4 text-red-600 bg-red-100 rounded px-3 py-2">
                    {(iniciarSesion.error as any)?.message || "No se pudo iniciar sesión."}
                </p>
            )}
            <div className="max-w-6xl mx-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4"
                >

                    {/* Email */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm" htmlFor="email">Email:</label>
                        <input 
                            type="email"
                            id="email"
                            {...register("email")}
                            className="border py-1 px-2 rounded"
                        />
                        {errors.email && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.email.message}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm" htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                            className="border py-1 px-2 rounded"
                        />
                        {errors.password && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.password.message}</p>}
                    </div>

                    {/* Botón */}
                    <button type="submit" disabled={iniciarSesion.isPending} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
                        {iniciarSesion.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
