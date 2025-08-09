import React from 'react'

const CheckEmailPage: React.FC = () => {
    return (
        <div className="p-8 min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">¡Casi listo!</h1>
                <p className="text-gray-600">
                    Hemos enviado un enlace de verificación a tu correo electrónico.
                </p>
                <p className="text-gray-600 mt-2">
                    Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
                </p>
            </div>
        </div>
    )
}

export default CheckEmailPage