FROM node:14-buster-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y libgssapi-krb5-2

# pre-copy/cache dependencies
COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
