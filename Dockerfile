FROM node:23-alpine AS builder

WORKDIR /app

ARG VITE_PINATA_PROJECT_ID
ARG VITE_PINATA_PROJECT_SECRET
ARG VITE_VAULT_CONTRACT

ENV VITE_PINATA_PROJECT_ID=$VITE_PINATA_PROJECT_ID
ENV VITE_PINATA_PROJECT_SECRET=$VITE_PINATA_PROJECT_SECRET
ENV VITE_VAULT_CONTRACT=$VITE_VAULT_CONTRACT

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]