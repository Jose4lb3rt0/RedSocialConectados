**RedSocialConectados** es una aplicación web de red social "Full Stack" que permite la interacción entre usuarios en tiempo real, publicación de contenido multimedia y gestión de amistades. Este proyecto fue diseñado como una solución integral para portafolio.

## 🚀 Características

  * **Presencia en Tiempo Real**: Visualización de amigos conectados mediante WebSockets.
  * **Gestión de Amistades**: Sistema de envío, aceptación y rechazo de solicitudes de amistad.
  * **Publicaciones Dinámicas**: Creación de posts con soporte para imágenes (vía Cloudinary).
  * **Interacción**: Sistema de reacciones y comentarios en publicaciones.
  * **Chat Privado**: Mensajería instantánea con indicadores de escritura ("typing") y confirmación de lectura.
  * **Notificaciones**: Alertas en tiempo real para interacciones y solicitudes.

## 🛠️ Stack Tecnológico

### Backend

  * **Java 21 (LTS)** y **Spring Boot 3**.
  * **Spring Security & JWT**: Autenticación y autorización segura.
  * **Spring Data JPA**: Persistencia de datos con PostgreSQL.
  * **WebSockets (STOMP)**: Comunicación bidireccional.
  * **Cloudinary SDK**: Gestión y optimización de imágenes en la nube.

### Frontend

  * **React 18** con **TypeScript**.
  * **Vite**: Herramienta de construcción ultrarrápida.
  * **TanStack Query (React Query)**: Gestión de estado asíncrono y caché.
  * **Tailwind CSS & Shadcn/UI**: Diseño moderno y responsivo.

-----

## 📦 Despliegue Local (Llave en mano)

El proyecto está completamente dockerizado para que cualquier persona pueda ejecutarlo sin necesidad de instalar Java, Node.js o PostgreSQL localmente.

### Requisitos Previos

  * Tener instalado **Docker** y **Docker Compose**.
  * Una cuenta gratuita de **Cloudinary**.

### Pasos para Ejecutar

1.  **Clonar el repositorio**:

    ```bash
    git clone https://github.com/Jose4lb3rt0/RedSocialConectados
    cd redsocialconectados
    ```

2.  **Configurar Variables de Entorno**:
    Crea un archivo llamado `.env` en la raíz del proyecto (basándote en `.env.example`) y completa tus credenciales:

    ```env
    CLOUDINARY_CLOUD_NAME=cloud_name
    CLOUDINARY_API_KEY=api_key
    CLOUDINARY_API_SECRET=api_secret
    JWT_SECRET=clave_muy_larga
    DB_USER=postgres
    DB_PASSWORD=postgres
    ```

3.  **Lanzar con Docker Compose**:

    ```bash
    docker-compose up --build
    ```

4.  **Acceder a la aplicación**:

      * **Frontend**: `http://localhost:5173`
      * **Backend (API)**: `http://localhost:8080`
    
