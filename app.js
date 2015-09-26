// _____________________________________________________________________________
// Setup

// Set up the port
var port = process.env.PORT || 8080;

// Require the necessary modules
var path = require("path");
var express = require('express');
var uuid = require("node-uuid");
var app = express();
var server = app.listen(port);
var io = require('socket.io')(server);


// _____________________________________________________________________________
// Serving static files

// Serve up the client-side code from public/ to the root (e.g. 127.0.0.1:8080/)
var publicPath = path.join(__dirname, 'public');
var staticServer = express.static(publicPath);
app.use(staticServer);


// _____________________________________________________________________________
// Real time communication


	// players[id] = {
	// 	pos
	// 	inactiveMarker
	// };
var players = { };

io.on('connection', function (socket) {
	console.log('a user connected');

	// Initial player setup 
	var playerId = uuid.v4();
	socket.on("player registration", function (playerData) {
		players[playerId] = playerData;
		socket.broadcast.emit("new player", {
			id: playerId,
			player: playerData
		});
	});

	// Player changed state
	socket.on("player moved", function(playerData) {
		players[playerId] = playerData;
		socket.broadcast.emit("player moved", {
			id: playerId,
			player: playerData
		});	
	});
	socket.on("player drawing", function(drawData) {
		socket.broadcast.emit("player drawing", drawData);	
	});

	// Player left
	socket.on('disconnect', function() {
		console.log('user disconnected');
		delete players[playerId];
		socket.broadcast.emit("player disconnected", playerId);
	});
});