var fs = require('fs');

var inputFile = "G:\\BIM+GIS\\ThreeJSAppDemo\\public\\models\\demo2.rvt.js";
var outputFile = "G:\\BIM+GIS\\ThreeJSAppDemo\\public\\models\\demo2.min.js";

function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g,"");
};

fs.readFile(inputFile, function(err, data){
	if(err) console.log(err);
	else{
		var result = [];
		data.toString().split('\n').forEach(function(line){
			result.push(trim(line));
		});
		fs.writeFile(outputFile, result.join(''), function(err){
			if(err) console.log(err);
			else console.log('Done');
		});
	}
});