FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Создаем директорию для БД
RUN mkdir -p /app/data

# Копируем все файлы
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]