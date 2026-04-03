import { useForm } from "react-hook-form"
import { useUsers } from "../hooks/useUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "../schemas/userSchemas"
import { Link } from "react-router-dom"

const LoginPage: React.FC = () => {
    const { iniciarSesion } = useUsers()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginFormData) => {
        iniciarSesion.mutate(data)
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-5">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

                {/* IZQUIERDA */}
                <div className="flex flex-col justify-center text-center">
                    <span className="flex gap-2 items-center justify-center mb-4">
                        <img
                            src="/logo-icono-nombre.png"
                            alt="Conectados Logo"
                            className="w-15 h-15"
                        />
                        <h1 className="text-4xl md:text-5xl font-black text-blue-500 leading-tight">
                            Conectados
                        </h1>
                    </span>
                    <p className=" text-gray-700 leading-relaxed">
                        Conecta con amigos alrededor del mundo
                    </p>
                </div>

                {/* DERECHA */}
                <div className="flex justify-center md:justify-start order-1 md:order-2">
                    <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 md:p-8">

                        {iniciarSesion.isError && (
                            <p className="mb-4 text-red-600 bg-red-100 rounded px-3 py-2">
                                {(iniciarSesion.error as any)?.message || "No se pudo iniciar sesión."}
                            </p>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="space-y-4"
                        >
                            {/* Email */}
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                id="email"
                                {...register("email")}
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-900"
                            />
                            {errors.email && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.email.message}</p>}

                            {/* Password */}
                            <input
                                type="password"
                                id="password"
                                {...register("password")}
                                placeholder="Contraseña"
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-900"
                            />
                            {errors.password && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.password.message}</p>}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={iniciarSesion.isPending}
                                className="w-full py-3 mb-4 bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md"
                            >
                                {iniciarSesion.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center mb-6">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="px-3 text-gray-500 text-sm">o</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        {/* Create Account Button */}
                        <Link to="/register" >
                            <button className="w-full py-3 bg-green-500 text-white font-bold rounded-lg text-lg hover:bg-green-600 active:bg-green-700 transition-colors shadow-md">
                                Crear cuenta nueva
                            </button>
                        </Link>

                        {/* Forgot Password Link */}
                        <div className="mt-6 text-center">
                            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
