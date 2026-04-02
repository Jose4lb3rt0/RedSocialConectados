FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# host 0.0.0.0 para que Vite acepte conexiones externas al contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]