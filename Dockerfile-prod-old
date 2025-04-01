### STAGE 1: Build the AngularJS app ###
FROM node:14-alpine as builder

RUN mkdir /app/
WORKDIR /app/
COPY package.json package-lock.json /app/

RUN apk add --update --no-cache git make python3 g++
RUN npm set progress=false && npm config set depth 0
RUN npm install
COPY . /app/
RUN npm run build -- --spa

### STAGE 2: Add Nginx for hosting the AngularJS app ###
FROM nginx:1.21-alpine
## Removes the default nginx html files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./compose/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
