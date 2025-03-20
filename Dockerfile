FROM node:20-alpine

ENV ENV_FILE=.env

WORKDIR /app

COPY package*json ./

RUN npm install --only=production

COPY . .



EXPOSE 3000

CMD ["npm", "start"]