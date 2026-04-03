import { useForm } from "react-hook-form"
import { useUsers } from "../hooks/useUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "../schemas/userSchemas"
import { Link } from "react-router-dom"

const RegisterPage: React.FC = () => {
    const { registrarUsuario } = useUsers()
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = (data: RegisterFormData) => {
        registrarUsuario.mutate(data)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    {registrarUsuario.isError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">
                                {(registrarUsuario.error as any)?.message || "No se pudo completar el registro."}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name and Surname Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm text-gray-600 mb-1"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Nombre"
                                    disabled={registrarUsuario.isPending}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    {...register('name', {
                                        required: 'El nombre es obligatorio',
                                        minLength: {
                                            value: 2,
                                            message: 'El nombre debe tener al menos 2 caracteres',
                                        },
                                    })}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="surname"
                                    className="block text-sm text-gray-600 mb-1"
                                >
                                    Apellido
                                </label>
                                <input
                                    id="surname"
                                    type="text"
                                    placeholder="Apellido"
                                    disabled={registrarUsuario.isPending}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    {...register('surname', {
                                        required: 'El apellido es obligatorio',
                                        minLength: {
                                            value: 2,
                                            message: 'El apellido debe tener al menos 2 caracteres',
                                        },
                                    })}
                                />
                                {errors.surname && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.surname.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label
                                htmlFor="gender"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Género
                            </label>
                            <select
                                id="gender"
                                disabled={registrarUsuario.isPending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                {...register('gender', {
                                    required: 'Selecciona un género',
                                })}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="male">Hombre</option>
                                <option value="female">Mujer</option>
                                <option value="other">Otro</option>
                                <option value="prefer_not">Prefiero no decir</option>
                            </select>
                            {errors.gender && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>

                        {/* Birthday */}
                        <div>
                            <label
                                htmlFor="birthday"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Fecha de nacimiento
                            </label>
                            <input
                                id="birthday"
                                type="date"
                                disabled={registrarUsuario.isPending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                {...register('birthday', {
                                    required: 'La fecha de nacimiento es obligatoria',
                                })}
                            />
                            {errors.birthday && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.birthday.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                disabled={registrarUsuario.isPending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                {...register('email', {
                                    required: 'El correo electrónico es obligatorio',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Ingresa un correo electrónico válido',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Contraseña"
                                disabled={registrarUsuario.isPending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                {...register('password', {
                                    required: 'La contraseña es obligatoria',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe tener al menos 6 caracteres',
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirmar contraseña"
                                disabled={registrarUsuario.isPending}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                {...register('confirmPassword', {
                                    required: 'Confirma tu contraseña',
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={registrarUsuario.isPending}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            {registrarUsuario.isPending ? 'Registrando...' : 'Registrar'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center border-t border-gray-200 pt-6">
                        <p className="text-gray-600 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
