FROM node:22

EXPOSE 5001

WORKDIR /app

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:prod"]