import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email({ message: "Por favor, introduce un email válido." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).max(100),
    confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).max(100),
    name: z.string().min(1, { message: "El nombre es obligatorio." }).max(50),
    surname: z.string().min(1, { message: "El apellido es obligatorio." }).max(50),
    gender: z.enum(["male", "female", "other", "prefer not to say"]),
    birthday: z.string().min(1, { message: "La fecha de nacimiento es obligatoria." }),

}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
})

export type RegisterFormData = z.infer<typeof registerSchema>