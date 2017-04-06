var fs = require('fs');

exports.Runner = function (req, res) {
  fs.readFile(__dirname + '/test.html', function (err, data) {
    if (err) return res.fail(err.message);
    res.end(data);
  });
};