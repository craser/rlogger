/*********************************************************************************
 * Load this into the window you want to debug. (I personally use a
 * debugging proxy to append this to some .js file that's already
 * being loaded.)
 *
 * This will cause messages passed to console.log() to also be sent to
 * the little http server created in rlogger.js.
 */


(function() {
    var enableDebug = false;
    var console = null;
    var monitorToken = null;
    var queue = [];
    var logf;
    var server = "[ MACIP ]"; // Replace this with the IP of the host where rlogger.js is running.
    var port = "[ PORT ]";    // Replace this with the PORT where rlogger.js is running.
    var sendLogToken = null;

    function segments(s) {
        try {
            if (!s) { return [""]; }

            var segs = [];
            // first, split on the carriage returns
            s.split("\n").forEach(function(l) {
                var nl = false;
                l.match(/.{1,1000}/g).forEach(function(c) {
                    segs.push((nl ? "→" : "") + c);
                    nl = true;
                    
                });
            });
            return segs;
        }
        catch (e) {
            return [e.toString()];
        }
    }

    var rjsl = {

        log: function(msg) {
            this.debug("push: " + msg);
            segments(msg).forEach(function(s) { queue.push(s); });
            if (queue.length == 1) {
                var self = this;
                setTimeout(function() { self.sendLog(); }, 0);
            }
        },

        debug: function(msg) {
            if (msg.indexOf("[ TICKET ]") != -1)
                alert(msg);
            if (enableDebug) {
                console.log.apply(console, arguments);
            }
        },

        sendLog: function() {
            try {
                if (sendLogToken) return; // If we're waiting on something, just wait.
                this.debug("sendLog()");
                if (queue.length) {
                    var random = Math.round(Math.random() * 10000);
                    var id = "script_" + random;
                    var url = "http://" + server + ":" + port + "/?"
                        + "id=" + id + "&"                              // cachebuster
                        + "k=" + encodeURIComponent("rjsl.cleanup('" + id + "')");

                    while (queue.length && (url.length < 1024)) {
                        var msg = queue.shift();
                        this.debug("shift: " + msg);
                        var message = encodeURIComponent(msg);
                        url += "&m=" + message;
                    }                    

                    var script = document.createElement("script");
                    script.id = id;
                    script.setAttribute("src", url);
                    var head = document.getElementsByTagName("head")[0];
                    head.appendChild(script);
                }
            }
            catch (e) {
                this.debug("Error in sendLog: " + e);
                this.debug("Waiting 3000ms to try sendLog again.");
                var self = this;
                sendLogToken = setTimeout(function() { // Wait, and signal that we're waiting.
                    sendLogToken = null; // Done waiting.
                    self.sendLog();
                }, 3000);
            }
        },

        cleanup: function(id) {
            this.debug("cleanup(\"" + id + "\")");
            var script = document.getElementById(id);
            script.parentNode.removeChild(script);
            this.debug("calling sendLog()");
            this.sendLog();
        },

        monitor: function() {
            this.debug("monitor()");
            try { 
                if ((window.console === console) && (window.console.log === logf)) {
                    this.debug("########################################");
                    this.debug("[log.js] console is fine.");
                    this.debug("########################################");
                }
                else {
                    this.init();
                    this.debug("########################################");
                    this.debug("[log.js] console was replaced!");
                    this.debug("########################################");
                }
            }
            catch (e) {
                alert(e);
            }
        },

        init: function() {
            var self = this;
            window.rjsl = self; // Needed so that un-scoped callback can do its thing.
            console = window.console || {};
            var k = console.log;
            logf = function() {
                k && k.apply(console, arguments);
                self.log.apply(self, arguments);
            };
			if (!window.console) window.console = console;
            window.console.log = logf;

            this.debug = function() {
                if (enableDebug) k.apply(console, arguments);
            };

            monitorToken = window.setInterval(function() { self.monitor(); }, 1000);
        }
    };

    rjsl.init();
    // If desired, replace "TICKET" with the current ticket you're working on so you can filter rlogger.js output.
    console.log("[ TICKET ] Remote JavaScript logging loaded. location: " + window.location.href);
    console.log("[ TICKET ] user agent: " + window.navigator.userAgent);
})();
