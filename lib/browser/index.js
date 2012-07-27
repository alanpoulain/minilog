var Minilog = require('./minilog.js');

// default formatter for browser
Minilog.format(function(name, level, args) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
 return prefix.concat(args).join(' ');
});

// support for enabling() console logging easily
var enabled = false, whitelist = [], levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function filter(name, level) {
  var i, expr;
  for(i = 0; i < whitelist.length; i++) {
    expr = whitelist[i];
    if (expr.topic && expr.topic.test(name) && levelMap[level] >= expr.level) {
      return true;
    }
  }
  return false;
}

Minilog.enable = function(str) {
  if(!enabled) { Minilog.pipe(require('./lib/browser/console.js')).filter(filter); }
  enabled = true;
  whitelist = [];
  var parts = (str || '*.debug').split(/[\s,]+/), i, expr;
  for(i = 0; i < parts.length; i++) {
    expr = parts[i].split('.');
    if(expr.length > 2) { expr = [ expr.slice(0, -1).join('.'), expr.slice(-1).join() ]; }
    whitelist.push({ topic: new RegExp('^'+expr[0].replace('*', '.*')), level: levelMap[expr[1]] || 1 });
  }
  if(typeof window != 'undefined' && window.localStorage) {
    window.localStorage.minilogSettings = JSON.stringify(str);
  }
};

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  if(window.localStorage && window.localStorage.minilogSettings) {
    Minilog.enable(JSON.stringify(window.localStorage.minilogSettings));
  }
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

exports = module.exports = Minilog;
exports.backends = { %backends_block% };