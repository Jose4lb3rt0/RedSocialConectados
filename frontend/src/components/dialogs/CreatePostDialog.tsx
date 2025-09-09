import { IoIosClose } from "react-icons/io"
import { useAuth } from "@/auth/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { FaPhotoVideo } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { postSchema, type PostFormData } from "@/schemas/postSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreatePost } from "@/hooks/usePosts"
import { useRef, useState, type ChangeEvent } from "react"

type CreatePostDialog = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CreatePostDialog: React.FC<CreatePostDialog> = ({ open, onOpenChange }) => {
    const { user } = useAuth()
    const createPost = useCreatePost()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
    })

    const onCreatePost = (data: PostFormData) => {
        const file = fileInputRef.current?.files?.[0] ?? undefined
        createPost.mutate(
            { content: data.content ?? "", file, type: "text" },
            {
                onSuccess: () => {
                    reset({ content: "" })     // limpia textarea
                    clearImage()               // limpia input file y preview
                    onOpenChange(false)        // cierra el diálogo
                }
            }
        )
        onOpenChange(false)
    }

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const prevUrlRef = useRef<string | null>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current) // esto libera memoria
            prevUrlRef.current = url
            setPreviewUrl(url)
        } else {
            if (prevUrlRef.current) {
                URL.revokeObjectURL(prevUrlRef.current)
                prevUrlRef.current = null
            }
            setPreviewUrl(null)
        }
    }

    const clearImage = () => {
        if (prevUrlRef.current) {
            URL.revokeObjectURL(prevUrlRef.current)
            prevUrlRef.current = null
        }
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Publicación</DialogTitle>
                    <DialogDescription>Aquí puedes crear el contenido de tu publicación.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onCreatePost)}>
                    <div className="space-y-2">
                        <textarea
                            className="w-full border rounded p-2"
                            placeholder={`¿Qué estás pensando, ${user?.name}?`}
                            rows={2}
                            {...register("content")}
                        />
                        {errors.content && <p className="text-red-500 bg-red-500/30 rounded py-1 px-2">{errors.content.message}</p>}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="file-input"
                            onChange={handleFileChange}
                        />

                        {previewUrl && (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Vista previa"
                                    className="w-full max-h-80 object-contain rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="shrink-0 p-2 bg-gray-200/50 hover:bg-gray-300/50 cursor-pointer rounded-full absolute top-2 right-2"
                                >
                                    <IoIosClose className="text-2xl" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center border p-2 rounded">
                            <span className="w-full text-gray-600 text-sm">Agregar a tu publicación</span>
                            <div className="flex space-x-2">
                                <label htmlFor="file-input" className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
                                    <FaPhotoVideo />
                                </label>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <button
                            type="submit"
                            disabled={createPost.isPending}
                            className="cursor-pointer mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Publicar
                        </button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    )
}

export default CreatePostDialog