import { useForm } from "react-hook-form"
import { useUsers } from "../hooks/useUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "../schemas/userSchemas"

const RegisterPage: React.FC = () => {
    const { registrarUsuario } = useUsers()
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = (data: RegisterFormData) => {
        registrarUsuario.mutate(data)
    }

    return (
        <div className="p-8 min-h-screen w-full">
            <div className="max-w-6xl mx-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4"
                >
                    {/* Nombres y apellidos */}
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm" htmlFor="name">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                {...register("name")}
                                className="border py-1 px-2 rounded"
                            />
                            {errors.name && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.name.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm" htmlFor="surname">Apellido</label>
                            <input id="surname" type="text" {...register("surname")} className="border py-1 px-2 rounded" />
                            {errors.surname && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.surname.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="gender">Género</label>
                        <select id="gender" {...register("gender")} className="border py-1 px-2 rounded">
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>
                            <option value="prefer not to say">Prefiero no decir</option>
                        </select>
                        {errors.gender && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.gender.message}</p>}

                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="birthday">Fecha de Nacimiento</label>
                        <input
                            id="birthday"
                            type="date"
                            {...register("birthday")}
                            className="border py-1 px-2 rounded"
                        />
                        {errors.birthday && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.birthday.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="email">Email</label>
                        <input id="email" type="email" {...register("email")} className="border py-1 px-2 rounded" />
                        {errors.email && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.email.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="password">Contraseña</label>
                        <input id="password" type="password" {...register("password")} className="border py-1 px-2 rounded" />
                        {errors.password && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.password.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input id="confirmPassword" type="password" {...register("confirmPassword")} className="border py-1 px-2 rounded" />
                        {errors.confirmPassword && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" disabled={registrarUsuario.isPending} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
                        {registrarUsuario.isPending ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
