import { useAuth } from "@/auth/AuthContext"
import Navbar from "./Navbar"
import ChatPanel from "../chat/ChatPanel"

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { isAuthenticated } = useAuth()

    return (
        <div>
            <Navbar />
            <main>
                {children}
            </main>
            
            {isAuthenticated && <ChatPanel/>}
        </div>
    )
}

export default Layout