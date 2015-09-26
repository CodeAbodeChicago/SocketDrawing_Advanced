// _____________________________________________________________________________
// Global Variables

// Connect to server using socket.io 
var socket = io();

// Global variables for our markers
var marker;
var eraser;

// A transparent canvas that will display where all the players are
var cursorCanvas;
var markerCanvas;

// Global variables for all the other players in the app
var players = {};


// _____________________________________________________________________________
// p5 Events

function setup() {
	colorMode(HSB, 360, 100, 100, 1);
	createCanvas(windowWidth, windowHeight);	
	background(0);
	strokeCap(ROUND);

	markerCanvas = createGraphics(width, height);
	cursorCanvas = createGraphics(width, height);

	var randHue = random(0, 360);
	marker = new Marker({ h: randHue, s: 100, b: 100 }, 10);
	eraser = new Marker({ h: 0, s: 0, b: 0 }, 50); // Thick black marker

	registerPlayer();
}

function draw() {
	if (mouseIsPressed) {
		// Draw with marker
		if (mouseButton === LEFT) {
			var p1 = { x: pmouseX, y: pmouseY };
			var p2 = { x: mouseX, y: mouseY };
			markerDraw(p1, p2, marker);
			sendMarkerMessage(p1, p2, marker);
		}
		// Eraser (e.g. draw with black)
		else if (mouseButton === RIGHT) {
			var p1 = { x: pmouseX, y: pmouseY };
			var p2 = { x: mouseX, y: mouseY };
			markerDraw(p1, p2, eraser);
			sendMarkerMessage(p1, p2, eraser);
		}
	}

	cursorCanvas.clear();
	for (var playerId in players) {
		var player = players[playerId];
		cursorDraw(player.pos, player.marker);
	}
	cursorDraw({ x: mouseX, y: mouseY }, marker);

	background(0);
	image(markerCanvas, 0, 0);
	image(cursorCanvas, 0, 0);

}

function mouseMoved() {
	sendMoveMessage();
}

function markerDraw(p1, p2, cMarker) {
	markerCanvas.strokeWeight(cMarker.thickness);
	markerCanvas.stroke(cMarker.color.h, cMarker.color.s, cMarker.color.b);
	markerCanvas.line(p1.x, p1.y, p2.x, p2.y);
}

function cursorDraw(pos, maker) {
	cursorCanvas.noStroke();
	cursorCanvas.fill(maker.color.h, maker.color.s, maker.color.b);
	var s = maker.thickness * 2;
	cursorCanvas.ellipse(pos.x, pos.y, s, s);
}


// _____________________________________________________________________________
// Socket Logic

socket.on("player drawing", function (drawData) {
	console.log("Server told me to draw another player");
	markerDraw(drawData.p1, drawData.p2, drawData.marker);
});

socket.on("new player", function (data) {
	console.log("new player")
	players[data.id] = data.player;
});

socket.on("player moved", function (data) {
	players[data.id] = data.player;
});

function sendMoveMessage() {
	socket.emit("player moved", {
		pos: { x: mouseX, y: mouseY },
		marker: marker
	});
}

function registerPlayer() {
	socket.emit("player registration", {
		pos: { x: mouseX, y: mouseY },
		marker: marker
	});
}

function sendMarkerMessage(p1, p2, currentMarker) {
	socket.emit("player drawing", {
		p1: p1,
		p2: p2,
		marker: currentMarker
	});	
}