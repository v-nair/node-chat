FROM node:20.18-slim

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
