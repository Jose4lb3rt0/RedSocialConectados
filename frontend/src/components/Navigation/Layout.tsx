import Navbar from "./Navbar"

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    )
}

export default Layout