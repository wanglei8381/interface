var pathToRegexp = require('path-to-regexp')
var tools = require('../util/tools')
var path = require('path')
var logger = require('../logger')('[Interface][router]')
var METHODS = require('http').METHODS

var Router = (module.exports = function (context) {
  var router = {}
  router.__proto__ = Router
  router.stack = []
  router.context = context
  context.router = router
  return router
})

Router.handleConfig = function (context, confs) {
  var router = {
    deploySuccess: true,
    keys: []
  }
  var name = path.resolve(path.join(context.project, confs.name))

  if (tools.isDir(name)) {
    name = path.join(name, 'if.js')
  }
  if (tools.isFile(name)) {
    router.name = name
    var fn = require(name).Runner
    if (Object.isFunction(fn)) {
      router.handle = fn
    } else {
      router.deploySuccess = false
    }
  } else {
    router.deploySuccess = false
  }

  if (!router.deploySuccess) return router

  if (!Object.isEmpty(confs.path)) {
    router.path = pathToRegexp(context.path + confs.path, router.keys, {
      strict: false,
      end: true,
      sensitive: true
    })
  } else {
    router.deploySuccess = false
  }

  if (!router.deploySuccess) return router

  var methods = []
  confs.method.split(',').forEach(function (method) {
    method = method.toUpperCase()
    if (METHODS.indexOf(method) > -1) {
      methods.push(method)
    }
  })

  if (Object.isEmpty(methods)) {
    methods = ['ALL']
  }

  if (methods.indexOf('ALL') > -1) {
    router.pass = true
  } else {
    router.pass = false
  }
  router.methods = methods
  router.public = !!confs.public
  this.stack.push(router)
}

Router.handle = function (req, res) {
  var router = null
  var stack = this.stack
  var params = (req.params = req.params || {})
  stack.each(function (item) {
    var path = item.path
    if (item.deploySuccess) {
      var result = path.exec(req.pathname)
      if (result) {
        router = item
        router.keys.forEach(function (key, index) {
          params[key.name] = result[index + 1]
        })
        return true
      }
    }
  })

  if (router) {
    if (router.pass || router.methods.indexOf(req.method) > -1) {
      router.handle(req, res)
    } else {
      res.fail('The ' + req.method.toLowerCase() + ' request does not support')
    }
  } else {
    res.fail('The i_f does not exist')
  }
}
