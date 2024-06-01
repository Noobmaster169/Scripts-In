FROM node

WORKDIR /opt/app

ENV NODE_ENV production

COPY package*.json ./

RUN npm install

COPY . /opt/app

RUN npm install --dev && npm run build

CMD [ "npm", "start" ]