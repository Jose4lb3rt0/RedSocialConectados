import { useUsers } from "@/hooks/useUsers"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { useForm } from "react-hook-form"
import { editProfileSchema, type EditProfileFormData } from "@/schemas/userSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { obtenerPerfil } from "@/services/UserService"

type EditProfileDialogProps = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ isOpen, setIsOpen }) => {
    const { actualizarPerfil } = useUsers()

    const { data: profile, isFetching } = useQuery({
        queryKey: ["profile"],
        queryFn: obtenerPerfil,
        enabled: isOpen //activar la consulta solo si el modal está abierto
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: "",
            surname: "",
            gender: "prefer not to say",
            birthday: "",
            biography: ""
        }
    })

    useEffect(() => {
        if (!profile) return
        const pad = (n: number) => String(n).padStart(2, '0')
        const birthday = profile.yearOfBirth
            ? `${profile.yearOfBirth}-${pad(profile.monthOfBirth)}-${pad(profile.dayOfBirth)}`
            : ""
        reset({
            name: profile.name,
            surname: profile.surname,
            gender: profile.gender,
            birthday: birthday,
            biography: profile.biography
        })
    }, [profile, reset])

    function onSubmit(values: EditProfileFormData) {
        actualizarPerfil.mutate(values, {
            onSuccess: () => setIsOpen(false),
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                    <DialogDescription>Modifica la información de tu perfil.</DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 mt-2"
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                            <label className="text-sm">Nombre</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                {...register("name")}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        {/* Apellido */}
                        <div>
                            <label className="text-sm">Apellido</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                {...register("surname")}
                            />
                            {errors.surname && <p className="text-red-500 text-sm">{errors.surname.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Género */}
                        <div>
                            <label className="text-sm">Género</label>
                            <select className="w-full border rounded px-2 py-1" {...register("gender")}>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                                <option value="prefer not to say">Prefiero no decir</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                        </div>
                        {/* Fecha de nacimiento */}
                        <div>
                            <label className="text-sm">Fecha de nacimiento</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-1"
                                {...register("birthday")}
                            />
                            {errors.birthday && <p className="text-red-500 text-sm">{errors.birthday.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm">Biografía</label>
                        <textarea
                            rows={4}
                            className="w-full border rounded px-2 py-1 resize-y"
                            {...register("biography")}
                            maxLength={500}
                        />
                        {errors.biography && <p className="text-red-500 text-sm">{errors.biography.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={actualizarPerfil.isPending || isFetching}
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                        >
                            {actualizarPerfil.isPending ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    )
}

export default EditProfileDialog