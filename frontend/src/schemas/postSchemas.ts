import z from "zod"

export const postSchema = z.object({
    content: z.string()
        .trim()
        .max(1000, { message: "El contenido no puede exceder los 1000 caracteres." }),
    media: z.any().optional(),
}).refine((data) => {
    const hasText = (data.content ?? "").trim().length > 0
    const hasMedia = !!data.media
    return hasText || hasMedia
}, { path: ["content"], message: "Debes agregar texto o una imagen." })

export type PostFormData = z.infer<typeof postSchema>

export const postCommentSchema = z.object({
    comment: z.string().trim().max(500, { message: "El comentario no puede exceder los 500 caracteres." }),
    media: z.any().optional(),
}).refine((data) => {
    const hasText = (data.comment ?? "").trim().length > 0
    const hasMedia = !!data.media
    return hasText || hasMedia
}, {  path: ["comment"], message: "Debes agregar texto o una imagen." })

export type PostCommentFormData = z.infer<typeof postCommentSchema>