/**
|*********************************************; 
*  Project        : Ordos
*  Program name   : Server  
*  Author         : www.otrisovano.ru
*  Date           : 15.05.2018 
*  Purpose        : check brain   
|*********************************************/


/*********************************************;
 *  CREATE APPLICATION
 *********************************************/
 
/** init server */
var express = require("express");
var app = express();
var http = require('http').Server(app);
console.log('server');
var io = require('socket.io')(http);
app.use(express.static('www'));
var server = app.listen(3050);
io.listen(server);


var gameObj = {};

var timerUpdate = setTimeout( updateGameData, 200);

function updateGameData(){
	console.log('sendData')
	io.sockets.emit('message', gameObj );
	timerUpdate = setTimeout( updateGameData, 500);	
}	

io.on('connection',function(socket){
	socket.on('clientData', function(data){	
		console.log('getData' + data.id);
	});
});  
 
