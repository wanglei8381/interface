// 文件缓存实例

var filePool = require('./src/pool/file_pool')

// 全局配置
filePool.config({
  basePath: __dirname,
  raw: true,
  compress: false
})

// 开启redis缓存
filePool.openRedisCache({
  db: 3,
  host: '192.168.1.183'
})

// 添加文件
filePool.define({ path: 'media.html', raw: true, compress: true })
filePool.define({
  name: 'wawaha',
  path: 'test.html',
  raw: true,
  compress: true
})

// 同时添加多个
filePool.define([
  { name: 'wawaha', path: 'test.html', raw: true, compress: true },
  { name: 'wawaha', path: 'test.html', raw: true, compress: true }
])

setImmediate(function () {
  filePool.get('media', function (err, stream) {
    console.log(err, stream)
  })

  filePool.get('wawaha', function (err, stream) {
    console.log(err, stream)
  })
}, 0)
