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