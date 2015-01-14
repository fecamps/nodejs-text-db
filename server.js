'use strict';

var fs = require('fs');
var path = require('path');

var http = require('http');

var bpm = {};
bpm.util = require('./bpm_util').util;

http.createServer(function (req, res) {
    var url = String(req.url);
    var msg;

    req.query = req.query || {};
    var list = url.split('?');
    var sub = list.shift();
    list = list.join('&').replace(/\&+/g, '&').split('&');
    var str;
    for (var i = 0, len = list.length; i < len; i++) {
        str = list[i].split('=');
        if (str[0]) {
            req.query[str[0]] = str[1];
        }
    }
    res.setHeader('content-type', 'text/javascript;charset=utf8');
    console.log('url=' + url + ';sub=' + sub);

    if (sub === '/api/del') {
        var mod_name = req.query['k'] || req.query['key'];
        fs.appendFile(path.resolve(__dirname + '/packlist.txt'), '\r\n,"' + mod_name + '": undefined', function (err) {
            if (err) throw err;
            var msg = 'del ' + mod_name + ' success.';
            console.log(msg);
            res.writeHead(200, {
                'hui_mod': 'success'
            });
            res.end(msg);
        });

    }
    else if (sub === '/api/set') {
        var mod_name = req.query['k'] || req.query['key'];
        var mod_value = req.query['v'] || req.query['value'];
        console.log(mod_name);
        console.log(mod_value);
        fs.appendFile(path.resolve(__dirname + '/packlist.txt'), '\r\n,"' + mod_name + '": "' + bpm.util.encode(mod_value) + '"', function (err) {
            if (err) throw err;
            var out = {};
            out[mod_name] = mod_value;
            res.end(JSON.stringify(out));
        });
    }
    else if (sub === '/api/get') {
        var mod_name = req.query['k'] || req.query['key'];
        var mod_value;
        fs.readFile(path.resolve(__dirname + '/packlist.txt'), function (err, data) {
            if (err) throw err;
            var out = {};
            var jsonObj = JSON.parse(data + '}');
            if (mod_name) {
                mod_value = bpm.util.decode(jsonObj[mod_name]);
                out[mod_name] = mod_value;
            }

            res.writeHead(200, {
                'content-type': 'text/html'
            });

            res.end(JSON.stringify(out));
        });
    }
    else {
        fs.readFile(path.resolve(__dirname + '/packlist.txt'), function (err, data) {
            if (err) throw err;
            var jsonObj = JSON.parse(data + '}');

            var html = ['<h1>Data list</h1><ul>'];
            var tpl = '<li><b>#{0}:</b> #{1} </li>';
            for (var i in jsonObj) {
                if (i && jsonObj[i]) {
                    html.push(bpm.util.format(tpl, i, bpm.util.decode(jsonObj[i])));
                }
            }

            res.writeHead(200, {
                'content-type': 'text/html'
            });
            res.end(html.join('\n'));
        });
    }

}).listen(8300);

console.log('Server is listen at http://localhost:8300');