import { IoIosClose } from "react-icons/io"
import { useAuth } from "@/auth/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { FaPhotoVideo } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { postSchema, type PostFormData } from "@/schemas/postSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreatePost, usePost, useUpdatePost } from "@/hooks/usePosts"
import { useEffect, useRef, useState, type ChangeEvent } from "react"

type CreatePostDialog = {
    open: boolean
    onOpenChange: (open: boolean) => void
    postId: number | null
}

const CreatePostDialog: React.FC<CreatePostDialog> = ({ open, onOpenChange, postId }) => {
    const { user } = useAuth()
    const post = usePost(postId)
    const createPost = useCreatePost()
    const updatePost = useUpdatePost()

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: { content: "", media: undefined },
        mode: "onChange",
    })

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [originalMediaUrl, setOriginalMediaUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [removeMedia, setRemoveMedia] = useState(false)
    const prevUrlRef = useRef<string | null>(null)

    const onCreatePost = (data: PostFormData) => {
        const content = (data.content ?? "").trim()

        // Editar post
        if (postId && postId > 0) {
            const noContentChange = content === (post.data?.content ?? "").trim()
            const noMediaChange = !selectedFile && !removeMedia
            if (noContentChange && noMediaChange) {
                onOpenChange(false)
                return
            }
            const payload: any = { id: postId }
            if (!noContentChange) payload.content = content
            if (selectedFile) payload.file = selectedFile
            if (removeMedia) payload.removeMedia = true

            updatePost.mutate(payload, {
                onSuccess: () => {
                    reset({ content: "" })
                    clearImage()
                    onOpenChange(false)
                }
            })
            return
        }

        // Crear post
        if (!content && !selectedFile) return
        createPost.mutate(
            { content, file: selectedFile ?? undefined, type: "text" },
            {
                onSuccess: () => {
                    reset({ content: "" })
                    clearImage()
                    onOpenChange(false)
                }
            }
        )
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        if (file) {
            const url = URL.createObjectURL(file)
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
            prevUrlRef.current = url
            setPreviewUrl(url)
            setSelectedFile(file)
            setRemoveMedia(false)
            setValue("media", file, { shouldValidate: true }) // hace válido "solo foto" (nuevo archivo)
        } else {
            if (prevUrlRef.current) {
                URL.revokeObjectURL(prevUrlRef.current)
                prevUrlRef.current = null
            }
            setPreviewUrl(originalMediaUrl)
            setSelectedFile(null)
            setValue("media", originalMediaUrl ? true : undefined, { shouldValidate: true }) // vuelve al estado según media existente si la hay
        }
    }

    const clearImage = () => {
        if (prevUrlRef.current) {
            URL.revokeObjectURL(prevUrlRef.current)
            prevUrlRef.current = null
        }
        setSelectedFile(null)
        setPreviewUrl(null)
        setOriginalMediaUrl(null)
        setRemoveMedia(false)
        setValue("media", undefined, { shouldValidate: true })
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    useEffect(() => {
        if (postId && post.data) {
            reset({ content: post.data.content ?? "", media: post.data.mediaUrl ? true : undefined })
            setOriginalMediaUrl(post.data.mediaUrl ?? null)
            setPreviewUrl(post.data.mediaUrl ?? null)
            setSelectedFile(null)
            setRemoveMedia(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } else if (!postId) {
            reset({ content: "", media: undefined })
            setOriginalMediaUrl(null)
            setPreviewUrl(null)
            setSelectedFile(null)
            setRemoveMedia(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }, [postId, post.data, reset])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{postId ? "Editar Publicación" : "Crear Publicación"}</DialogTitle>
                    <DialogDescription>Aquí puedes {postId ? "editar" : "crear"} tu publicación.</DialogDescription>
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
                        <input type="hidden" {...register("media")} />

                        {previewUrl && (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Vista previa"
                                    className="w-full max-h-80 object-contain rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedFile) {
                                            // descartar archivo nuevo y volver a la original
                                            if (prevUrlRef.current) {
                                                URL.revokeObjectURL(prevUrlRef.current)
                                                prevUrlRef.current = null
                                            }
                                            setSelectedFile(null)
                                            setPreviewUrl(originalMediaUrl)
                                            setRemoveMedia(false)
                                            if (fileInputRef.current) fileInputRef.current.value = ""
                                            // sigue contando la media existente
                                            setValue("media", originalMediaUrl ? true : undefined, { shouldValidate: true })
                                        } else {
                                            // marcar para eliminar imagen existente
                                            setPreviewUrl(null)
                                            setRemoveMedia(true)
                                            setValue("media", undefined, { shouldValidate: true })
                                        }
                                    }}
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
                            disabled={createPost.isPending || updatePost.isPending}
                            className="cursor-pointer mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {postId ? (updatePost.isPending ? "Guardando..." : "Guardar") : (createPost.isPending ? "Publicando..." : "Publicar")}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePostDialog