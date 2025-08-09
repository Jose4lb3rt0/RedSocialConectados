import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const HomePage: React.FC = () => {
    const [estaLogeado, setEstaLogeado] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("jwt")
        setEstaLogeado(!!token)
    }, [])

    if (estaLogeado) {
        return (
            <div>
                <h1>Mi muro</h1>
                <button onClick={() => {
                    localStorage.removeItem("jwt");
                    window.location.reload();
                }}>Cerrar sesión</button>
            </div>
        )
    }

    return (
        <div>
            <h1>¡Bienvenido a Conectados!</h1>
            <Link to="/login">
                <button>Iniciar Sesión</button>
            </Link>
            <Link to="/register">
                <button>Registrar</button>
            </Link>
        </div>
    )
}

export default HomePage
