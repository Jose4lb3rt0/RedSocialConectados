import { FaCamera, FaPencilAlt, FaPlus } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { editProfileSchema, type EditProfileFormData } from "@/schemas/userSchemas"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { obtenerPerfil } from "@/services/UserService"
import { zodResolver } from "@hookform/resolvers/zod"
import EditProfileDialog from "@/components/dialogs/EditProfileDialog"
import ChangeMyPictureDialog from "@/components/dialogs/ChangeMyPictureDialog"
import { apiFetch } from "@/api/apibase"
import { useAuth } from "@/auth/AuthContext"

const ProfilePage: React.FC = () => {
    const { refreshMe } = useAuth()
    const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
    const [changeMyPhotoMode, setChangeMyPhotoMode] = useState<"profile" | "banner">("profile")
    const [isChangeMyPictureDialogOpen, setIsChangeMyPictureDialogOpen] = useState(false)
    const queryClient = useQueryClient()

    // Query principal para la página (no para el modal)
    const { data: userProfile, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: obtenerPerfil
    })

    const {
        reset
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: "",
            surname: "",
            gender: "prefer not to say",
            // birthday: "",
            biography: ""
        }
    })

    useEffect(() => {
        if (userProfile) {
            reset({
                name: userProfile.name,
                surname: userProfile.surname,
                gender: userProfile.gender,
                // birthday: userProfile.birthday,
                biography: userProfile.biography ?? ""
            })
        }
    }, [userProfile, reset])

    const openEdit = async () => {
        setIsEditProfileDialogOpen(true)
        await queryClient.invalidateQueries({ queryKey: ["profile"] })
    }

    const handleSavePicture = async (file: File) => {
        try {
            const formData = new FormData()
            formData.append("file", file)

            let endpoint = changeMyPhotoMode === "profile"
                ? "/users/me/profile-picture"
                : "/users/me/banner-picture"

            await apiFetch(endpoint, {
                method: "PATCH",
                body: formData,
            })
            
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["profile"] }),
                refreshMe()
            ])
        } catch (error: any) {
            console.error("Error al subir la imagen:", error)
        }
    }

    if (isLoading) return <p>Cargando perfil...</p>
    if (error instanceof Error) return <p>Error al cargar perfil: {error.message}</p>

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Banner */}
            <div className="bg-blue-200 w-full h-50 relative rounded-b-md">
                {/* Imagen de banner */}
                <img
                    src={userProfile?.bannerPicture?.imagenUrl || "/placeholder-banner.png"}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-b-md"
                />
                {/* Sombreado de negro */}
                <div className="bg-gradient-to-b from-transparent to-black/30 w-full h-[20%] absolute bottom-0 z-10 rounded-b-md"></div>
                <button
                    className="absolute bottom-3 right-5 z-11 flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
                    onClick={() => {
                        setChangeMyPhotoMode("banner")
                        setIsChangeMyPictureDialogOpen(true)
                    }}
                >
                    <FaCamera />
                    Agregar foto de portada
                </button>

                {/* Foto de perfil */}
                <div className="absolute flex items-center justify-center -bottom-20 left-10 z-11">
                    <div className="relative flex items-center justify-center w-30 h-30 rounded-full overflow-hidden bg-white">
                        <img
                            src={userProfile?.profilePicture?.imagenUrl || "/placeholder-avatar.png"}
                            alt="Foto de perfil"
                            className="w-[95%] h-[95%] object-cover bg-blue-300 rounded-full"
                        />
                    </div>
                    {/* Botón de cambiar foto de perfil */}
                    <button
                        className="absolute bottom-2 right-2 bg-gray-500 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition-all duration-300"
                        onClick={() => {
                            setChangeMyPhotoMode("profile")
                            setIsChangeMyPictureDialogOpen(true)
                        }}
                    >
                        <FaCamera className="text-white" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex items-center justify-between ms-[13.5%]">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">
                        {userProfile?.name} {userProfile?.surname}
                    </h1>
                    <p className="text-gray-600 font-semibold">XX amigos</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300">
                        <FaPlus className="text-white" />
                        Agregar historia
                    </button>

                    <button
                        onClick={openEdit}
                        // onClick={() => setIsEditProfileDialogOpen(true)}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
                    >
                        <FaPencilAlt className="text-white" />
                        Editar perfil
                    </button>

                </div>
            </div>

            <EditProfileDialog
                isOpen={isEditProfileDialogOpen}
                setIsOpen={setIsEditProfileDialogOpen}
            />

            <ChangeMyPictureDialog
                mode={changeMyPhotoMode}
                isOpen={isChangeMyPictureDialogOpen}
                setIsOpen={setIsChangeMyPictureDialogOpen}
                onSave={(file) => {
                    handleSavePicture(file)
                }}
            />
        </div>
    )
}

export default ProfilePage