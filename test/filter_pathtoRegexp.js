var pathToRegExp = require('../lib/filter/pathToRegExp')
var assert = require('assert')

describe('path-to-regexp', function () {
  describe('strings', function () {
    it('简单的路径', function () {
      var m = pathToRegExp('/test').exec('/test')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')
    })

    it('尾部有斜线，请求没有斜线', function () {
      var m = pathToRegExp('/test/').exec('/test')
      assert.equal(m, null)
    })

    it('尾部没有斜线，请求有斜线', function () {
      var m = pathToRegExp('/test').exec('/test/')
      assert.equal(m, null)
    })

    it('尾部有斜线，请求有斜线', function () {
      var m = pathToRegExp('/test/').exec('/test/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/')
    })

    it('尾部有(无)斜线，请求有(无)斜线', function () {
      var m = pathToRegExp('/test/?').exec('/test/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/')
      m = pathToRegExp('/test/?').exec('/test')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')
    })

    it('路径中有/**,该路径以后的请求全部通过', function () {
      var m = pathToRegExp('/test/**').exec('/test')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')

      m = pathToRegExp('/test/**').exec('/test/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')

      m = pathToRegExp('/test/**').exec('/test/m/a')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')

      m = pathToRegExp('/test/***/m/**').exec('/test/m/a')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')
    })

    it('路径中有/*', function () {
      var m = pathToRegExp('/test/*').exec('/test')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')

      m = pathToRegExp('/test/*').exec('/test/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/')

      m = pathToRegExp('/test/*').exec('/test/abc')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/abc')

      m = pathToRegExp('/test/*').exec('/test/abc/')
      assert.equal(m, null)
    })

    it('路径中有多个/*', function () {
      var m = pathToRegExp('/test/*/*').exec('/test')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test')

      m = pathToRegExp('/test/*/*').exec('/test/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/')

      m = pathToRegExp('/test/*/*').exec('/test/abc')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/abc')

      m = pathToRegExp('/test/*/*').exec('/test/abc/')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/abc/')

      m = pathToRegExp('/test/*/*').exec('/test/abc/abc')
      assert.equal(m.length, 1)
      assert.equal(m[0], '/test/abc/abc')

      m = pathToRegExp('/test/*/*').exec('/test/abc/abc/')
      assert.equal(m, null)
    })
  })
})
