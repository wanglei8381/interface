function pathtoRegexp(path) {
  path = path[0] === '/' ? path : '/' + path;
  path = '^' + path;
  var index = path.indexOf('/**');
  if (index > -1) {
    path = path.substr(0, index) || '/';
  } else {
    path += '$';
  }

  index = path.indexOf('/*');
  if (index > -1) {
    path = path.replace(/\/\*/g, '/?\\w*');
  }

  path = path.replace(/([\/\.])/g, '\\$1');

  return new RegExp(path);
}

exports.pathtoRegexp = pathtoRegexp;