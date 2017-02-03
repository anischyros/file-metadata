var express = require("express");
var fs = require("fs");
var formidable = require("formidable");

var app = express();

app.get("/", function(request, response)
{
	fs.createReadStream("index.html").pipe(response);
});

app.post("/get-file-size", upload);

app.listen(8080);
console.log("Listening to port 8080");

function isFormData(request)
{
	var type = request.headers["content-type"];
	if (!type)
		return false;
	return type.indexOf("multipart/form-data") == 0;
}

function upload(request, response)
{
	var fileName;
	var fileSize;
	var filePath;

	if (!isFormData(request))
	{
		response.statusCode = 400;
		response.setHeader("Content-Type", "text/html");
		response.send("<h1>Bad Request:  Expecting multipart/form-data</h1>");
		return;
	}

	var form = new formidable.IncomingForm();

	form.on("file", function(name, file)
	{
		fileName = file.name;
		fileSize = file.size;
		filePath = file.path;
	});

	form.on("end", function()
	{
		fs.unlink(filePath);

		var obj = { name: fileName, size: fileSize };
		response.setHeader("Content-Type", "text/json");
		response.send(JSON.stringify(obj));
	});

	form.parse(request);
}

