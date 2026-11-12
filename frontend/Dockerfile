FROM node:22-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /etc/nginx/templates

EXPOSE 80
