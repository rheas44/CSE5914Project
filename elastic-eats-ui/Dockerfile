FROM node:20.12.2

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g npm@10.5.0 && npm install

COPY . ./

EXPOSE 5173

CMD ["npm", "run", "dev"]




