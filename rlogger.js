var port = 8080;
console.log('port: ' + port);
require('http').createServer(function(req, res) {
    var callback = "alert('error')";
    try { 
        var q = require('url').parse(req.url, true);
        var message = q.query.m;
        callback = q.query.k;
        if (typeof message === 'string') {
            logMessage(q.query.m);
        }
        else {                                    // Array of values of m.
            for (var i = 0; i < message.length; i++) {
                logMessage(message[i]);
            }
        }
    }
    catch (e) {
        logMessage(e);
    }
    finally {
        res.end(callback);
    }
}).listen(port);

function logMessage(message) {
    console.log(formatDate() + " | " + message);
}

function formatDate() {
    function pad(n) { return (n < 10) ? "0" + n : "" + n; }
    var date = new Date();
    var h = pad(date.getHours());
    var m = pad(date.getMinutes());
    var s = pad(date.getSeconds());
    return h + ":" + m + ":" + s;
}


console.log('started');
console.log('==============================');
