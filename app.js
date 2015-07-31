// Manual Installs
// Python 2.7 required
// PhantomJS required
// http://stackoverflow.com/questions/14278417/cannot-install-node-modules-that-require-compilation-on-windows-7-x64-vs2012
// npm config set msvs_version 2013 --global
// OR
// npm install weak npm config set msvs_version 2013 --global
// OR
// npm install -g node-gyp -msvs_version=2013 && npm install -g restify
// GTK : http://ftp.gnome.org/pub/gnome/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip -- MUST BE VERSION 2!!!

/*
TODO:
REM 1 - Take screenshots that are required according to csv file -- DONE
REM 2 - Compare current (V1) to new (V2)
REM 3 - Create HTML with V1 + V2 + Differences if present, else OK image
REM 4 - Email the HTML file
REM 5 - Allow user to place v2 as new v1 - NICE TO HAVE :)
*/
var fs = require('fs');
var csv = require('csv');
var colors = require('colors');
var resemble = require('node-resemble'); // or drop the -js 

var imageDir = "images/";
var csvFile = "urls.csv";

var parser = csv.parse({delimiter: ','},function(err, data){
	for(var i = 0; i < data.length; i++){
		var url = data[i][0];
    var imageBase = imageDir + data[i][1];
		var imageName = imageBase + ".png";
    var compareImage = imageBase+"-base.png";
		renderAndSave(url, imageName);
    diffScreenshots(url, compareImage, imageName, imageBase+"-diff.png");
	}
});

fs.createReadStream(csvFile).pipe(parser);

// ------ HELPERS ------
function renderAndSave(url, imageName){
	var phantom = require('phantom');

	phantom.create(function (ph) {
	  ph.createPage(function (page) {
  		page.open(url, function (status) {
  			page.render(imageName);
  			ph.exit();
  		});
	  });
	});
}

function diffScreenshots(url, image1, image2, diffImage){

  resemble(image1).compareTo(image2).ignoreColors().onComplete(function(data){
    
    if(data.misMatchPercentage > 0.0){
        console.log("BOO, DIFF FOR [ ".red + url +" ]".red); 
        var png = data.getImageDataUrl();
        var writePng = png.replace(/^data:image\/png;base64,/, "");
        
        fs.writeFile(diffImage, writePng, "base64", function (err) {
          if (err) {
            throw 'error writing file [ ' + diffImage + ' ] error [ ' + err + ' ]';
          }
        });   
    }else{
        console.log("NO DIFF FOR [ ".green + url +" ]".green); 
    }
  });
}
