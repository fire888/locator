/**
|***************************************; 
*  Project        : Ordos 
*  Program name   : Client  
*  Author         : www.otrisovano.ru
*  Date           : 14.05.2018 
*  Purpose        : check brain   
|***************************************;
*/  

"use strict"; 


var socket, timerSendDataClient;
socket = io();

var clientData = {id: Math.floor(Math.random()*1000)};
console.log( clientData.id )

var sendDataToServer = function () {
	
	socket.emit( 'clientData', clientData );
	timerSendDataClient = setTimeout( sendDataToServer, 500);
}

var getDataFromServer = function () {
	socket.on( 'message', function (data) {			
	});	
}

sendDataToServer();
getDataFromServer();

