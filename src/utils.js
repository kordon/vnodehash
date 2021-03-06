var merge = require('deepmerge'),
    type = require('type-component'),
    sha1 = require('sha1')

/**
 * gossip contructor arguments parser
 */
exports.args = function () {
  var args = {
    servers: [],
    options: {
      replicas: 3,
      vnodes: 1024
    }
  }

  Array.prototype.slice.apply(arguments).forEach(function (argument) {
    if(type(argument) === 'string') args.servers = [argument]
    if(type(argument) === 'array') args.servers = argument
    if(type(argument) === 'object') args.options = merge(args.options, argument)
  })

  return args
}

exports.metadata = function (server) {
  return {
    name: server,
    hostname: server.split(':').shift(),
    port: server.split(':').pop(),
    id: sha1(server)
  }
}

exports.array = function (length, n) {
  if(type(n) !== 'number') n = 0
  return Array.apply(null, Array(length)).map(Number.prototype.valueOf, n)
}

exports.slice = function(array, from, count) {
  var to = from + count;
  var result = [];

  if(from === 0) {
    from = (from - Math.floor(count/2))
    to = (from + Math.ceil(count/2) + 1)
  } else if(from > 0) {
    from -= 1
    to -= 1
  }

  for(; from < to; from += 1) {
    var i = from

    if(from < 0 || from >= array.length)
      i = array.length - Math.abs(from)

    result.push(array[i]);
  }

  return result;
}