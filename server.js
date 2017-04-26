var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function(req, res, next){
	res.sendFile(__dirname + '/views/index.html');
});

app.listen(3000, function(){
	console.log('Server running at port 3000...');
});