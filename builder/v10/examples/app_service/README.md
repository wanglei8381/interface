# interface 框架演示项目

## 项目基本目录结构：
  项目名<br>
   |-- CA证书<br>
   |-- 工程名1<br>
   |-- 工程名2<br>
   |-- app.js(启动文件)<br>
   |-- service.json(服务配置文件)<br>

## service.json 启动项目时会首先加载
  {<br>
    "server": {<br>
      "name": "app_service",<br>
      "services": {<br>
        "name": "app", //项目名称<br>
        "project": "app", //项目的目录相对于service.json的目录<br>
        "path": "/app", //请求路径<br>
        "port": "9000" //端口号，默认3000<br>
      },<br>
      "multipartResolver": {<br>
        "auto": true,//上传文件是否自动处理,false需要用户自己处理<br>
        "path": "D:\\usr\\local\\files" //临时上传目录<br>
      }<br>
    }<br>
  }<br>

## interface.json 接口配置文件
  {<br>
    "interfaces": [//接口<br>
      {<br>
        "name": "ifs/app.js",//接口的目录文件<br>
        "path": "/app/:id",//接口请求路径<br>
        "method": "ALL" //请求方式GET,POST,PUT,DELETE<br>
      },<br>
      {<br>
        "name": "ifs/if.js",<br>
        "path": "/app/main",<br>
        "method": "GET,POST"<br>
      }<br>
    ],<br>
    "filters": [//过滤器<br>
      {<br>
        "mapping": "/app", //拦截的路径<br>
        "exclude-mapping": "/app/main/**", //排除的路径<br>
        "target": "/filters/main.js" //过滤器文件<br>
      }<br>
    ]<br>
  }<br>