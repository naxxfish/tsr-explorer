FROM node:12.2.0-alpine as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
RUN npm install react-scripts@^3.4.0 -g --silent
COPY . /app
RUN npm run build
RUN ls /app/build
FROM nginx:1.17.9-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf