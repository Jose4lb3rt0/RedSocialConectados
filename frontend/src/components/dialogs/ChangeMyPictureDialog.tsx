import React, { useCallback, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { FaSave, FaTrashAlt, FaUpload } from "react-icons/fa"
import Cropper from "react-easy-crop"
import getCroppedImg from "@/lib/utils"
import { Slider } from "../ui/slider"
import { useAuth } from "@/auth/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { obtenerPerfil } from "@/services/UserService"

type ChangeMyPictureDialogProps = {
    mode: "profile" | "banner"
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onSave: (file: File) => void
}

const ChangeMyPictureDialog: React.FC<ChangeMyPictureDialogProps> = ({ isOpen, setIsOpen, mode, onSave }) => {
    const [step, setStep] = useState(1)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const { user } = useAuth()

    const inputId = `file-${mode}` //htmlFor

    const { data: profileOriginal, isFetching } = useQuery({
        queryKey: ["profile"],
        queryFn: obtenerPerfil,
        enabled: isOpen
    })


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecciona un archivo de imagen.")
            return
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            setImageSrc(reader.result as string)
        }
    }

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
        const croppedFile = new File([croppedBlob], selectedFile!.name, { type: selectedFile!.type })
        await onSave(croppedFile)
        setIsOpen(false)
        setSelectedFile(null)
        setImageSrc(null)
        setCroppedAreaPixels(null)
    }

    const aspect = mode === "profile" ? 1 / 1 : 16 / 9

    useEffect(() => {
        if (!isOpen) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
                setPreviewUrl(null)
            }
            setStep(1)
            setSelectedFile(null)
            setImageSrc(null)
            setCroppedAreaPixels(null)
            setZoom(1)
        }
    }, [isOpen, previewUrl])

    const bannerSrc = mode === "banner"
        ? previewUrl || profileOriginal?.bannerPicture?.imagenUrl || "/placeholder-banner.png"
        : profileOriginal?.bannerPicture?.imagenUrl || "/placeholder-banner.png"

    const profileSrc = mode === "profile"
        ? previewUrl || profileOriginal?.profilePicture?.imagenUrl || "/placeholder-avatar.png"
        : profileOriginal?.profilePicture?.imagenUrl || "/placeholder-avatar.png"

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar {mode === "profile" ? "foto de perfil" : "foto de banner"}</DialogTitle>
                    <DialogDescription>
                        {step === 1 && (
                            <p className="text-sm text-gray-500">
                                Selecciona una nueva imagen para tu {mode === "profile" ? "foto de perfil" : "foto de banner"}.
                            </p>
                        )}
                        {step === 2 && (
                            <p className="text-sm text-gray-500">
                                Así se verá tu {mode === "profile" ? "foto de perfil" : "foto de banner"}. ¿Estás seguro de que deseas guardar los cambios?
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex flex-col gap-2">
                        {!selectedFile ? (
                            <div className="flex items-center gap-3">
                                <input
                                    id={inputId}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor={inputId}
                                    className="flex justify-center mx-10 w-full items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 cursor-pointer"
                                >
                                    <FaUpload className="text-white" />
                                    <span>Subir foto</span>
                                </label>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    className="flex justify-center mx-10 w-full items-center gap-2 bg-gray-200 px-4 py-2 rounded-sm hover:bg-gray-300 transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSelectedFile(null)
                                        setImageSrc(null)
                                        setCroppedAreaPixels(null)
                                    }}
                                >
                                    <FaTrashAlt className="text-red-500" />
                                    <span className="font-medium">{selectedFile.name}</span>
                                </button>
                            </div>
                        )}

                        {imageSrc && (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="relative w-full h-70 bg-gray-200 mt-4">
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={aspect}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                </div>
                                <Slider
                                    className="mt-4"
                                    value={[zoom]}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onValueChange={(vals) => setZoom(vals[0] ?? 1)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-4 items-center">
                        {/* Vista previa de demostración */}
                        {(() => {
                            // const bannerUrl = mode === "banner" ? previewUrl : null
                            // const profileUrl = mode === "profile" ? previewUrl : null

                            return (
                                <div className="w-[360px] rounded-md shadow bg-gray-100 overflow-hidden relative">
                                    {/* Banner */}
                                    <div className="w-full h-28 relative">
                                        <img src={bannerSrc} alt="Banner preview" className="w-full h-full object-cover" />

                                        {/* Foto de perfil */}
                                        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full ring-2 ring-white bg-gray-300 overflow-hidden">
                                            <img src={profileSrc} alt="Avatar preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    {/* Nombre */}
                                    <div className="pt-10 px-4 pb-4">
                                        <h3 className="text-base font-semibold">
                                            {user?.name} {user?.surname}
                                        </h3>
                                        <p className="text-xs text-gray-500">Vista previa</p>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                )}

                {imageSrc && (
                    <DialogFooter>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={() => {
                                    if (step === 1) {
                                        setIsOpen(false)
                                    } else {
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl)
                                            setPreviewUrl(null)
                                        }
                                        setStep(1)
                                    }
                                }}
                            >
                                {step === 1 ? "Cancelar" : "Volver"}
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                                onClick={async () => {
                                    if (step === 1) { // Generamos preview recortada antes de confirmar
                                        if (imageSrc && croppedAreaPixels) {
                                            const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
                                            const url = URL.createObjectURL(blob)
                                            setPreviewUrl(url)
                                        }
                                        setStep(2)
                                    } else if (step === 2) {
                                        await handleSave()
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl)
                                            setPreviewUrl(null)
                                        }
                                    }
                                }}
                            >
                                <FaSave className={`${step === 1 ? "hidden" : "block"}`} />
                                {step === 1 ? "Siguiente" : "Guardar"}
                            </button>
                        </div>
                    </DialogFooter>
                )}

            </DialogContent>
        </Dialog>
    )
}

export default ChangeMyPictureDialog