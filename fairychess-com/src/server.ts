
import * as WebSocket from 'ws';
import { WEB_SOCKET_SERVER_PORT ,WEB_SERVER_PORT} from "./net_lib";
import * as http from "http";




var webserver = http.createServer(function(req:http.IncomingMessage,res:http.ServerResponse<http.IncomingMessage>){
    //TODO serve up App
    if (req.url == '/') { 
        // set response header
        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        
        // set response content    
        res.write('<html><body><p>This is home Page.</p></body></html>');
        res.end();
    }
    
});
webserver.listen(WEB_SERVER_PORT);


const server = new WebSocket.Server({
    port: WEB_SOCKET_SERVER_PORT
});

type Game = {
    white: WebSocket,
    black: WebSocket
}

let sockets: WebSocket[] = [];

console.log("starting chess server...");

server.on('connection', function (socket: WebSocket) {
    console.log("created a connection");
    sockets.push(socket);

    socket.on('message', function (msg: string) {
        //TODO
        console.log(msg);
    });



    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function () {
        sockets = sockets.filter(s => s !== socket);
        console.log("closed connection");
    });

});


console.log("Started FC server...");

