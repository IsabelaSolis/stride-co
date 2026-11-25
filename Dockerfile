FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
# Render monta el archivo secreto. Config lo busca en config/
CMD ["sh", "-c", "ln -sf /etc/secrets/local-production.json config/local-production.json && npm start"]