import { Dialog, DialogContent, DialogHeader } from "../ui/dialog"
import { SlOptions } from "react-icons/sl"
import { useComment, useComments, useCreateComment, useDeleteComment, usePost, useUpdateComment } from "@/hooks/usePosts"
import { useAuth } from "@/auth/AuthContext"
import Post from "../posts/Post"
import { IoSend } from "react-icons/io5"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { postCommentSchema, type PostCommentFormData } from "@/schemas/postSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaUser } from "react-icons/fa"

type PostViewDialogProps = {
    postId: number | null
    open: boolean
    onOpenChange: () => void
}

const PostViewDialog: React.FC<PostViewDialogProps> = ({ postId, open, onOpenChange }) => {
    const [isCommentOptionMenuOpen, setIsCommentOptionMenuOpen] = useState<number | null>(null)
    const [isEditingCommentId, setIsEditingCommentId] = useState<number | null>(null)
    const [editText, setEditText] = useState<string>("")
    const { data: post, isLoading, isError } = usePost(postId ?? undefined)
    const { data: commentsPage, isLoading: commentsLoading, isError: commentsError } = useComments(open ? (postId ?? undefined) : undefined)
    const { user } = useAuth()
    const createComment = useCreateComment(postId ?? 0)
    const updateComment = useUpdateComment(postId ?? 0)
    const deleteComment = useDeleteComment(postId ?? 0)
    const fresh = useComment(isEditingCommentId ?? undefined)

    useEffect(() => {
        if (!open) {
            setIsCommentOptionMenuOpen(null)
            setIsEditingCommentId(null)
            setEditText("")
        }
    }, [open])

    useEffect(() => {
        if (isEditingCommentId && fresh.data?.id === isEditingCommentId) setEditText(fresh.data.comment ?? "")
    }, [fresh.data, isEditingCommentId])

    const handleClose = (o: boolean) => { if (!o) onOpenChange() }

    const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm<PostCommentFormData>({
        resolver: zodResolver(postCommentSchema),
        defaultValues: { comment: "", media: undefined },
        mode: "onChange"
    })

    useEffect(() => { if (open) requestAnimationFrame(() => setFocus("comment")) }, [open, setFocus])

    const onCreateComment = (data: PostCommentFormData) => {
        const comment = (data.comment ?? "").trim()
        if (!comment) return
        createComment.mutate(
            { comment, media: data.media instanceof File ? data.media : undefined },
            {
                onSuccess: () => reset({ comment: "", media: undefined }),
                onError: (error) => console.error("Error al crear comentario:", error)
            }
        )
    }

    const handleCommentOptionMenuToggle = (commentId: number) => {
        setIsCommentOptionMenuOpen((v) => (v === commentId ? null : commentId))
    }

    const handleEditComment = (commentId: number, initialText: string) => {
        setIsEditingCommentId(commentId)
        setIsCommentOptionMenuOpen(null)
        setEditText(initialText ?? "")
    }

    const onEditCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isEditingCommentId) return
        const text = editText.trim()
        if (!text) return
        updateComment.mutate(
            { id: isEditingCommentId, comment: text },
            {
                onSuccess: () => {
                    setIsEditingCommentId(null)
                    setEditText("")
                }
            }
        )
    }

    const onDeleteComment = (commentId: number) => {
        deleteComment.mutate(commentId, { onError: (error) => console.error("Error al eliminar comentario:", error) })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-xl p-0"
                onOpenAutoFocus={(e) => {
                    e.preventDefault()
                    setFocus("comment")
                }}
            >
                <div className="grid max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden">

                    {/* HEADER */}
                    <DialogHeader className="py-4 border-b">
                        <DialogTitle className="text-lg font-medium text-center">
                            Publicación de {post?.authorName}
                        </DialogTitle>
                    </DialogHeader>

                    {/* OVERFLOW */}
                    <div className="overflow-y-auto px-4 py-4 space-y-3">
                        {isLoading && <p>Cargando...</p>}
                        {isError && <p>No se pudo cargar el post.</p>}
                        {post && (
                            <Post
                                post={post}
                                canManage={user?.id === post.authorId}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                onComment={() => { }}
                            />
                        )}

                        {commentsLoading && <p>Cargando comentarios...</p>}
                        {commentsError && <p>No se pudieron cargar los comentarios.</p>}
                        {commentsPage?.content && (
                            <ul className="space-y-3">
                                {commentsPage.content.length > 0 ? (
                                    commentsPage.content.map((c: any) => (
                                        <li key={c.id} className="flex">
                                            <div className="rounded-full bg-gray-300 h-8 w-8 flex-shrink-0 mr-3 overflow-hidden border flex items-center justify-center">
                                                {c.authorPhotoUrl ? (
                                                    <img src={c.authorPhotoUrl} alt={c.authorName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <FaUser className="h-5 w-5 text-gray-500" />
                                                )}
                                            </div>

                                            {!isEditingCommentId || isEditingCommentId !== c.id ? (
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center space-x-2 relative">
                                                        <div className="w-full flex flex-col p-2 bg-gray-100 rounded">
                                                            <span className="text-sm font-semibold">{c.authorName}</span>
                                                            <span className="text-sm">{c.comment}</span>
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                className={`${isCommentOptionMenuOpen === c.id ? 'bg-gray-200' : ''} p-3 rounded-full hover:bg-gray-200 cursor-pointer`}
                                                                onClick={() => handleCommentOptionMenuToggle(c.id)}
                                                            >
                                                                <SlOptions className="h-3 w-3 text-gray-500" />
                                                            </button>

                                                            {isCommentOptionMenuOpen === c.id && (
                                                                <div className="absolute top-full right-0 mt-1 w-44 bg-white border rounded shadow-md z-10">
                                                                    <ul>
                                                                        {c.authorId === user?.id && (
                                                                            <>
                                                                                <li>
                                                                                    <button
                                                                                        onClick={() => handleEditComment(c.id, c.comment)}
                                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    >
                                                                                        Editar
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button onClick={() => onDeleteComment(c.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                                                                        Eliminar
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(c.createdAt).toLocaleString()} {c.edited && " · editado"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <form
                                                    onSubmit={onEditCommentSubmit}
                                                    className="w-full flex flex-col space-y-2"
                                                >
                                                    <textarea
                                                        style={{ resize: "none" }}
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="w-full border rounded p-2 text-sm"
                                                        placeholder="Editar comentario..."
                                                    />
                                                    <div className="flex justify-between items-center gap-2 text-xs">
                                                        <span
                                                            onClick={() => { setIsEditingCommentId(null); setEditText("") }}
                                                            className="font-bold text-blue-500 cursor-pointer inline-block border-b border-transparent hover:border-current"
                                                        >
                                                            Cancelar
                                                        </span>
                                                        <button
                                                            type="submit"
                                                            disabled={updateComment.isPending || editText.trim().length === 0}
                                                            className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {updateComment.isPending ? "Guardando..." : "Guardar"}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-center text-sm text-gray-600">Sé el primero en comentar.</li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="border-t p-4">
                        <form onSubmit={handleSubmit(onCreateComment)}>
                            <div className="relative">
                                <textarea
                                    {...register("comment")}
                                    style={{ resize: "none" }}
                                    className="w-full border rounded p-2 pr-14 text-sm"
                                    placeholder="Escribe un comentario..."
                                    rows={3}
                                />
                                {errors.comment && <p className="text-sm text-red-600 mt-1">{errors.comment.message}</p>}
                                <button
                                    className="px-2 py-2 text-blue-600 rounded hover:bg-blue-100 absolute right-3 bottom-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="submit"
                                >
                                    <IoSend />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PostViewDialog