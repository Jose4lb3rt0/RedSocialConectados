import { useSearchParams } from "react-router-dom"
import { useUsers } from '../hooks/useUsers'
import { useEffect } from "react"

const VerifyAccountPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { verificarCuenta } = useUsers()
    const { isPending, isSuccess, isError } = verificarCuenta

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            verificarCuenta.mutate(token)
        }
    }, [searchParams])

    const renderizado = () => {
        if (isPending) {
            return <p>Verificando tu cuenta, por favor espera...</p>
        }
        if (isSuccess) {
            return <p className="text-green-600">¡Cuenta verificada! Serás redirigido al inicio de sesión.</p>
        }
        if (isError) {
            return <p className="text-red-500">Hubo un error al verificar tu cuenta. El enlace puede haber expirado.</p>
        }
        if (!searchParams.get('token')) {
            return <p className="text-red-500">Token de verificación no encontrado. Por favor, revisa el enlace.</p>
        }
        return null
    }

    return (
        <div className="p-8 min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Verificación de Cuenta</h1>
                {renderizado()}
            </div>
        </div>
    )
}

export default VerifyAccountPage