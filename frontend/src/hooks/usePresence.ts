import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/api/apibase"
import { useAuth } from "@/auth/AuthContext"

async function obtenerAmigosConectados(): Promise<string[]> {
    return apiFetch("/presence/amigos")
}

// Devuelve el Set de emails de amigos conectados.
// La carga inicial es HTTP y las actualizaciones llegan por WebSocket al caché desde useWebSocket.

export function usePresence() {
    const { isAuthenticated } = useAuth()

    const { data: emailsConectados = [] } = useQuery<string[]>({
        queryKey: ["presence", "amigos"],
        queryFn: obtenerAmigosConectados,
        enabled: isAuthenticated,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        initialData: []
    })

    const conectadosSet = new Set(emailsConectados)

    function estaConectado(email: string | undefined | null): boolean {
        if (!email) return false
        return conectadosSet.has(email)
    }

    return { estaConectado, emailsConectados }
}