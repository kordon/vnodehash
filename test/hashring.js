var vnhr = process.env.VNHR_COV ? require('../lib-cov/vnhr') : require('../'),
    assert = require('assert')

suite('hashring')

test('constructs with a string', function () {
  var ring = vnhr('192.168.0.102:11212')
  
  assert(ring.pnodes.length === 1)
  //ring.ring.length.should.be.above(1);
})

test('constructs with a array', function () {
  var ring = vnhr([
    '192.168.0.102:11212',
    '192.168.0.103:11212',
    '192.168.0.104:11212'
  ])
  
  assert(ring.pnodes.length === 3)
  //ring.ring.length.should.be.above(1);
})

// TODO: construct with options
// {
//   vnodes: 10
// }

test('constructs with a object', function () {
  var ring = vnhr({
    '192.168.0.102:11212': 2,
    '192.168.0.103:11212': 2,
    '192.168.0.104:11212': 2
  })

  assert(ring.pnodes.length === 3)
  //ring.ring.length.should.be.above(1);
  
  assert(ring.pnodes.every(function (pnode) {
    return pnode.weight > 1
  }))
})

test('constructs with no arguments', function () {
  var ring = vnhr()
  
  assert(ring.pnodes.length === 0)
  //ring.ring.should.have.length(0);
})

it('generates the correct amount of points', function () {
  var ring = new Hashring({
      '127.0.0.1:11211': 600
    , '127.0.0.1:11212': 400
  });

  ring.ring.length.should.equal(160 * 2);
});

it('adds server after zero-argument constructor', function () {
  var ring = new Hashring();
  ring.add('192.168.0.102:11212');

  ring.servers.should.have.length(1);
  ring.ring.length.should.be.above(1);
});

it('looks up keys', function () {
  var ring = new Hashring([
      '192.168.0.102:11212'
    , '192.168.0.103:11212'
    , '192.168.0.104:11212'
  ]);

  ring.find(ring.hashValue('foo')).should.be.above(-1);

  // NOTE we are going to do some flaky testing ;P
  ring.get('foo').should.equal('192.168.0.102:11212');
  ring.get('pewpew').should.equal('192.168.0.103:11212');

  // we are not gonna verify the results we are just gonna test if we don't
  // fuck something up in the code, so it throws errors or whatever

  // unicode keys, just because people roll like that
  ring.find(ring.hashValue('привет мир, Memcached и nodejs для победы')).should.be.above(-1);

  // other odd keys
  ring.find(ring.hashValue(1)).should.be.above(-1);
  ring.find(ring.hashValue(0)).should.be.above(-1);
  ring.find(ring.hashValue([])).should.be.above(-1);
  ring.find(ring.hashValue({wtf:'lol'})).should.be.above(-1);

  // this should work as both objects are converted to [object Object] by
  // the .toString() constructor
  ring.get({wtf:'lol'}).should.equal(ring.get({wtf:'amazing .toStringing'}));
});

it('looks up keys', function () {
  var ring = new Hashring([
      '192.168.0.102:11212'
    , '192.168.0.103:11212'
    , '192.168.0.104:11212'
  ]);

  ring.find(ring.hashValue('foo')).should.be.above(-1);

  // NOTE we are going to do some flaky testing ;P
  ring.get('foo').should.equal('192.168.0.102:11212');
  ring.get('pewpew').should.equal('192.168.0.103:11212');

  // we are not gonna verify the results we are just gonna test if we don't
  // fuck something up in the code, so it throws errors or whatever

  // unicode keys, just because people roll like that
  ring.find(ring.hashValue('привет мир, Memcached и nodejs для победы')).should.be.above(-1);

  // other odd keys
  ring.find(ring.hashValue(1)).should.be.above(-1);
  ring.find(ring.hashValue(0)).should.be.above(-1);
  ring.find(ring.hashValue([])).should.be.above(-1);
  ring.find(ring.hashValue({wtf:'lol'})).should.be.above(-1);

  // this should work as both objects are converted to [object Object] by
  // the .toString() constructor
  ring.get({wtf:'lol'}).should.equal(ring.get({wtf:'amazing .toStringing'}));
});

it('should create the correct long value for a given key', function () {
  var ring = new Hashring({
      '127.0.0.1:11211': 600
    , '127.0.0.1:11212': 400
  });

  ring.hashValue('test').should.equal(3446378249);
});

it('should find the correct long value for a given key', function () {
  var ring = new Hashring({
      '127.0.0.1:11211': 600
    , '127.0.0.1:11212': 400
  });

  ring.ring[ring.find(ring.hashValue('test'))].value.should.equal(3454255383);
});

it('swaps servers', function () {
  var ring = new Hashring([
        '192.168.0.102:11212'
      , '192.168.0.103:11212'
      , '192.168.0.104:11212'
    ])
    , amazon = ring.get('justdied')
    , skynet = '192.168.0.128:11212';

  ring.swap(amazon, skynet);
  ring.cache.get("justdied").should.equal(skynet);

  // After a cleared cache, it should still resolve to the same server
  ring.cache.reset();
  ring.get('justdied').should.equal(skynet);
});

it('removes servers', function () {
  var ring = new Hashring([
      '192.168.0.102:11212'
    , '192.168.0.103:11212'
    , '192.168.0.104:11212'
  ]);

  ring.remove('192.168.0.102:11212');
  ring.ring.forEach(function (node) {
    node.server.should.not.equal('192.168.0.102:11212');
  });
});

it('Removes the last server', function () {
  var ring = new Hashring('192.168.0.102:11212');
  ring.remove('192.168.0.102:11212');

  ring.servers.should.have.length(0);
  ring.ring.should.have.length(0);
});

it('returns 20 servers', function () {
  var ring = new Hashring([
      '192.168.0.102:11212'
    , '192.168.0.103:11212'
    , '192.168.0.104:11212'
  ]);

  ring.range('foo', 20, false).should.have.length(20);
});

it('returns 3 servers as we only want unique servers', function () {
  var ring = new Hashring([
      '192.168.0.102:11212'
    , '192.168.0.103:11212'
    , '192.168.0.104:11212'
  ]);

  ring.range('foo', 20, false).should.have.length(20);
});

it('has an even distribution', function () {
  var iterations = 100000
    , nodes = {
          '192.168.0.102:11212': 1
        , '192.168.0.103:11212': 1
        , '192.168.0.104:11212': 1
      }
    , ring = new Hashring(nodes);

  function genCode (length) {
    length = length || 10;
    var chars = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890"
      , numChars = chars.length
      , ret = ""
      , i = 0;

    for (; i < length; i++) {
        ret += chars[parseInt(Math.random() * numChars, 10)];
    }

    return ret;
  }

  var counts = {}
    , node
    , i
    , len
    , word;

  for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      counts[node] = 0;
  }

  for (i = 0, len = iterations; i < len; i++) {
    word = genCode(10);
    node = ring.get(word);
    counts[node] = counts[node] || 0;
    counts[node]++;
  }

  var total = Object.keys(counts).reduce(function reduce (sum, node) {
    return sum += counts[node];
  }, 0.0);

  var delta = 0.05
    , lower = 1.0 / 3 - 0.05
    , upper = 1.0 / 3 + 0.05;

  for (node in counts) {
    (counts[node] / total).should.be.within(lower, upper);
  }
});