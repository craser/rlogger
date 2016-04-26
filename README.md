# rlogger
Super-Basic Remote JavaScript Logger

  * **log.js** should be loaded in the window you're trying to debug. It sends messages passed to console.log() to the remote logging server.
  * **rlogger.js** is the remote logging server. It listens for messages passed from **log.js**.
