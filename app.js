// Manual Installs
// Python 2.7 required
// PhantomJS required
// http://stackoverflow.com/questions/14278417/cannot-install-node-modules-that-require-compilation-on-windows-7-x64-vs2012
// npm config set msvs_version 2013 --global
// OR
// npm install weak npm config set msvs_version 2013 --global
// OR
// npm install -g node-gyp -msvs_version=2013 && npm install -g restify

/*
TODO:
REM 1 - Take screenshots are required
REM 2 - Compare current (V1) to new (V2)
REM 3 - Create HTML with V1 + V2 + Differences if present, else OK image
REM 4 - Email the HTML file
*/
var fs = require('fs');
var phantom = require('phantom');

renderAndSave("http://www.github.com","github.png");

// ----- HELPERS -----
function renderAndSave(url, imageName){
	
	phantom.create(function (ph) {
	  ph.createPage(function (page) {
		page.open(url, function (status) {
			page.render(imageName);
			ph.exit();
		});
	  });
	});
}