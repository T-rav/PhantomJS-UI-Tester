// Manual Installs
// Python 2.7 required
// PhantomJS required
// npm install  --msvs_version=2010 # Seems to work perfect with 2010 install
// http://stackoverflow.com/questions/14278417/cannot-install-node-modules-that-require-compilation-on-windows-7-x64-vs2012
// npm config set msvs_version 2012 --global
// OR
// npm install weak npm config set msvs_version 2012 --global
// OR
// npm install -g node-gyp -msvs_version=2013 && npm install -g restify
// GTK : http://ftp.gnome.org/pub/gnome/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip -- MUST BE VERSION 2!!!

/*
TODO:
REM 1 - Take screenshots that are required according to csv file -- DONE
REM 2 - Compare current (V1) to new (V2) -- DONE
REM 3 - Create HTML with V1 + V2 + Differences if present, else OK image
REM 4 - Email the HTML file
REM 5 - Allow user to place v2 as new v1 - NICE TO HAVE :)
*/
var fs = require('fs');
var csv = require('csv');
var colors = require('colors');
var resemble = require('node-resemble');

var captured_text = "";
var totalTest = 0, failedTest = 0, passedTest = 0;
var imageDir = "images/";
var csvFile = "urls.csv";
 
var logTestData = function(url, currentImage, baseImage, difImage, status, testCase){
	totalTest++;
	
	captured_text += "<tr><td valign='bottom' style='font-style:italic'>"+testCase+"</td><td valign='bottom'>"+url+"</td><td><a href='"+currentImage+"'><img height='150' width='150' src='"+currentImage+"'/></a></td>";
	captured_text += "<td><a href='"+baseImage+"'><img height='150' width='150' src='"+baseImage+"'/></a>";
	
	var color = 'green';
	if(status === 'FAIL'){
		color = 'red';
		failedTest++;
	}else{
		passedTest++;
	}
	
	if(!difImage){
		captured_text += "</td><td></td><td style='color:"+color+"' >"+status+"</td></tr>";
	}else{
		captured_text += "</td><td><a href='"+difImage+"'><img height='150' width='150' src='"+difImage+"'/></a></td><td style='color:"+color+"' >"+status+"</td></tr>";
	}
	
};

process.on('exit', function() {

	var testPackageName = "Demo App";
	var currentdate = new Date(); 
	var testRunTS = "Test Run: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
				
	var percentPassed = (passedTest-failedTest) / ((passedTest + failedTest) / 2) * 100;
	
	if(percentPassed < 0){
		percentPassed = 100 + percentPassed;
	}
	
	var runStatus = "FAILED TEST RUN";
	if(failedTest === 0){
		runStatus = "PASSED TEST RUN";
	}
	
	var htmlHeader = "<html><style> table {border-collapse: collapse;} table, th, td { border: 1px solid black; } th { background-color: #778899; color: white; } td { padding: 5px; background-color: #FFF5EE; } </style> ";
	htmlHeader += "<body bgcolor='#fff'> <b>Layout Test Case Executor (LTCE) </b> <br/> <br/> Test Report For <u>" + testPackageName + "</u> <br/> <br/> " + testRunTS + "</br>";
	
	var htmlResultsTable = "<table><tr><th>Total Test</th><th>Passed</th><th>Failed</th><th>Percentage Success</th><th>Run Status</th></tr>";
	htmlResultsTable += "<tr><td>"+totalTest+"</td><td>"+passedTest+"</td><td>"+failedTest+"</td><td>" + percentPassed.toFixed(2) + " % </td><td>"+runStatus+"</tr></table><br/><br/>";
	var htmlReportHeader = "Test Cases <br/><table><tr><th>Test Case</th><th>URL</th><th>Current Image</th><th>Base Image</th><th>Image Dif</th><th>Status</th></tr>";
	var htmlFooter = "</table></body></html>";
	
	fs.writeFileSync('run.html', htmlHeader+htmlResultsTable+htmlReportHeader+captured_text+htmlFooter);
});

var parser = csv.parse({delimiter: '|'}, function(err, data){
	for(var i = 0; i < data.length; i++){
		
		var url = data[i][0];
		
		var testCase = data[i][1];
		var imageBase = imageDir + data[i][1];
		var imagePath = imageBase + ".png";
		var compareImage = imageBase+"-base.png";
		var diffImage = imageBase+"-diff.png";

		removeOldImages(imagePath);
		renderAndSave(url, compareImage, imagePath, diffImage, testCase);
	}
});

fs.createReadStream(csvFile).pipe(parser);

// ------ HELPERS ------
function renderAndSave(url, compareImage, imagePath, diffImage, testCase){

	var phantom = require('phantom');
	phantom.create(function (ph) {
	  ph.createPage(function (page) {
  		page.open(url, function (status) {
  			page.render(imagePath);
			ph.exit();
			
			// Time to complete saving image :)
			setTimeout(function(){
				diffScreenshots(url, compareImage, imagePath, diffImage, testCase);
			}, 1500);
			
  		});
	  });
	});
}

function removeOldImages(imagePath){
	if(fs.existsSync(imagePath)){
		fs.unlinkSync(imagePath);
	}		
}

function diffScreenshots(url, image1, image2, diffImage, testCase){

  if(!fs.existsSync(image1) || !fs.existsSync(image2)){
	console.log(colors.red("WHAT THE?!, UNABLE TO DIFF [ " + url +" ] DUE TO MISSING IMAGE DATA"));
	logTestData(url, image1, image2, diffImage, "UNABLE TO DIFF - MISSING IMAGE", testCase);
  }
  
  resemble(image1).compareTo(image2).ignoreColors().onComplete(function(data){

    if(data.misMatchPercentage > 0.0){
        console.log(colors.red("BOO, DIFF FOR [ " + url +" AS " + testCase + " ]"));
		logTestData(url, image1, image2, diffImage, "FAIL", testCase);
		
        var png = data.getImageDataUrl();
        var writePng = png.replace(/^data:image\/png;base64,/, "");
        
        fs.writeFile(diffImage, writePng, "base64", function (err) {
          if (err) {
            console.log(colors.red('error writing file [ ' + diffImage + ' ] error [ ' + err + ' ]'));
			logTestData(url, image1, image2, diffImage, "UNABLE TO DIFF - ERROR [ " + err + " ]", testCase);
          }
        });   
    }else{
        console.log(colors.green("NO DIFF FOR [ " + url + " AS " + testCase + " ]")); 
		logTestData(url, image1, image2, null, "PASS", testCase);
    }
  });
}
