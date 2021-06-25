const NodeMediaServer = require("./");
var HashMap = require("hashmap");
var net = require("net");
const Logger = require("./node_core_logger");
const { Console } = require("console");
const { has } = require("lodash");
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 80000,
    gop_cache: true,
    ping: 40,
    ping_timeout: 60,
    /*
    ssl: {
      port: 443,
      key: './privatekey.pem',
      cert: './certificate.pem',
    }
	*/
  },
  http: {
    port: 8000,
    mediaroot: "./media",
    webroot: "./www",
    allow_origin: "*",
    api: true,
  },
  https: {
    port: 8443,
    key: "./privatekey.pem",
    cert: "./certificate.pem",
  },
  auth: {
    api: true,
    api_user: "admin",
    api_pass: "admin",
    play: false,
    publish: false,
    secret: "nodemedia2017privatekey",
  },
};
//! defining hashmap for keyValues
let keyValueEntries = new HashMap();

let nms = new NodeMediaServer(config);
nms.run();

nms.on("preConnect", (id, args) => {
  console.log(
    "[NodeEvent on preConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postConnect", (id, args) => {
  console.log(
    "[NodeEvent on postConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("doneConnect", (id, args) => {
  console.log(
    "[NodeEvent on doneConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("prePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("donePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("prePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("donePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

var server = net.createServer(function (socket) {
  socket.on("data", function (data) {
    var stringBuffer = data.toString();

    let keyValues = stringBuffer.split("}");
    keyValues.every((value) => {
      let sessionBuffer = null;
      let keyValuePair = value.substring(1).split(",");
      if (keyValuePair[1] == undefined) return false;
      if (keyValuePair[0] === "key") {
        Logger.log("public key retrieved [from user] " + keyValuePair[1]);
        Logger.log("new key making sessionBuffer");
        var newSessionBuffer = new HashMap();
        keyValueEntries.set(keyValuePair[1].toString(), newSessionBuffer);
      } else {
        sessionBuffer = keyValueEntries.get(keyValuePair[0].toString());
        sessionBuffer.set(keyValuePair[1], keyValuePair[2]);
      }
      return true;
    });
  });
});

// {streamName, {timestamp , sig}}

server.listen(1936, "0.0.0.0");
module.exports = {
  hashmap: keyValueEntries,
};
