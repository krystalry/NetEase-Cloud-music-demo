/**
 * Created by Think on 2019/1/17.
 */
var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.argv[2];
var qiniu = require('qiniu');

if(!port){
    process.exit(1)
}

var server = http.createServer(function(request, response){
    var parsedUrl = url.parse(request.url, true);
    var pathWithQuery = request.url;
    var queryString = '';
    if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname;
    var query = parsedUrl.query;
    var method = request.method;

    /******** 开始 ************/

    if(path==='/uptoken'){
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/json;charset=utf-8');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.removeHeader('Date');

        var config = fs.readFileSync('./qiniu-key.json');
        config = JSON.parse(config);

        let {accessKey, secretKey} = config;
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var options = {
            scope: 'netease-cloud-music'
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);
        response.write(`
    {
      "uptoken": "${uploadToken}"
    }
    `);
        response.end()
    }else{
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html;charset=utf-8');
        response.end()
    }

    /******** 结束 ************/
});

server.listen(port);