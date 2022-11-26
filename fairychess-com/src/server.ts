const http = require("http");
import * as WebSocket from 'ws';

const WEB_SOCKET_SERVER_PORT = 8080;

const server = new WebSocket.Server({
    port: WEB_SOCKET_SERVER_PORT
});



let sockets:WebSocket[] = [];

server.on('connection', function (socket:WebSocket) {
    sockets.push(socket);

    // When you receive a message, send that message to every socket.
    socket.on('message', function (msg:string) {
        //TODO
    });



    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function () {
        sockets = sockets.filter(s => s !== socket);
    });


});


console.log("Started FC server...");

