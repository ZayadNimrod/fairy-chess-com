
import { WebSocketServer, WebSocket } from "ws";
import { WEB_SOCKET_SERVER_PORT, WEB_SERVER_PORT, WEB_SOCKET_SERVER_URL } from "./net_lib";
import * as http from "http";
import * as fs from "fs/promises";





var webserver = http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {
    console.log(`responding to a request from ${JSON.stringify(req.socket.address())}`);
    if (req.url == '/') {
        //TODO don't read the HTML page EVERY TIME we respond, we could do it once and store in memory
        fs.readFile(__dirname + "/index.html").then(contents => {
            console.log(`sending homepage`);
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
            return;
        }).catch(err => {
            console.log(`error: ${err}`)
            res.writeHead(500);
            res.end(err);
            return;
        });
    } else {
        if (req.url.endsWith(".js") || req.url.endsWith(".css") || req.url.endsWith(".wasm")) {
            //serve the requested file.
            //TODO I'm sure we could make this more secure.

            fs.readFile(__dirname + req.url).then(contents => {
                console.log(`serving resource ${req.url}`);
                var content_type: string = "";
                if (req.url.endsWith(".js")) {
                    content_type = "text/javascript";
                } else if (req.url.endsWith(".wasm")) {
                    content_type = "application/wasm";
                } else if (req.url.endsWith(".css")) {
                    content_type = "text/css";
                }
                res.setHeader("Content-Type", content_type);
                res.writeHead(200);
                res.end(contents);
                return;
            }).catch(err => {
                console.log(`error: ${err}`)
                res.writeHead(500);
                res.end(err);
                return;
            });
        }

    }

});
webserver.listen(WEB_SERVER_PORT, WEB_SOCKET_SERVER_URL, () => {
    console.log(`Server is running on http://${WEB_SOCKET_SERVER_URL}:${WEB_SERVER_PORT}`);
});



type Game = {
    white: WebSocket,
    black: WebSocket
}

let open_sockets: WebSocket[] = [];

console.log("starting chess server...");

const socket_server = new WebSocketServer({
    port: WEB_SOCKET_SERVER_PORT
});

socket_server.on('connection', function connection(socket: WebSocket) {
    console.log(`created a socket connection with ${socket}, now have ${open_sockets.length} open`);
    open_sockets.push(socket);

    socket.on('message', function message(msg: string) {
        //TODO
        console.log(`recieved:${msg}`);
    });



    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function () {
        open_sockets = open_sockets.filter(s => s !== socket);
        console.log("closed connection");
    });

});


console.log("Started FC server...");

