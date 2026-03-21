import { useAuth } from "@/auth/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useConversaciones, useObtenerOCrearConversacion } from "@/hooks/useChats";
import type { ConversacionDto } from "@/services/ChatService";
import ChatWindow from "./ChatWindow";
import { FaComment, FaTimes, FaUser } from "react-icons/fa";

export default function ChatPanel() {
    const { user } = useAuth()
    const { ventanasAbiertas } = useChat()

    if (!user) return null

    return (
        < div className="fixed bottom-0 right-16 flex items-end gap-3 z-40" >
            {
                ventanasAbiertas.map((v) => (
                    <ChatWindow
                        key={v.conversacionId}
                        conversacionId={v.conversacionId}
                        otroUsuarioName={v.otroUsuarioName}
                        otroUsuarioPhotoUrl={v.otroUsuarioPhotoUrl}
                    />
                ))
            }
        </div >
    )
}