# 项目部署 docker+nginx+vue

## vue项目部署
- 打包vue项目  yarn build / npm run build  此时工程根目录下多出一个 dist 文件夹
- Nginx 是一个高性能的 HTTP 和反向代理服务器，此处我们选用 Nginx 镜像作为基础来构建我们的vue应用镜像。
- docker pull nginx
- 在项目根目录下创建 nginx 文件夹，该文件夹下新建文件 default.conf, 写入如下配置
- proxy_pass 需改成请求的地址，如果请求地址没有api就重写为空，否则不用 rewrite
```
server {
  listen       80;
  server_name  localhost;

  #charset koi8-r;
  access_log  /var/log/nginx/host.access.log  main;
  error_log  /var/log/nginx/error.log  error;

  location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
}

#error_page  404              /404.html;

# redirect server error pages to the static page /50x.html
#
error_page   500 502 503 504  /50x.html;
location = /50x.html {
    root   /usr/share/nginx/html;
}
location /api/ {
proxy_pass http://192.168.99.100:7001;
rewrite "^/api/(.*)$" /$1 break;
}
} 
```
- 该配置文件定义了首页的指向为 /usr/share/nginx/html/index.html，所以我们可以一会把构建出来的 index.html 文件和相关的静态资源放到 /usr/share/nginx/html 目录下。
- 创建 Dockerfile 文件
```
FROM nginx
COPY dist/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
```
- 打包镜像
```
docker build -t vue-app .
```
- 运行容器
```
docker run -p 3000:80 -d --name vue-app vue-app
```
  1. docker run 基于镜像启动一个容器
  2. -p 3008:80 端口映射，将宿主的3000端口映射到容器的80端口
  3. -d 后台方式运行
  4. --name 容器名，查看 Docker 进程
- docker ps 查看运行的容器
