FROM nginx
WORKDIR /usr/src/app/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist  /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]