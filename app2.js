var page = require('webpage').create();
var pages = ['http://localhost:65368/index.html#/?searchString=peter&page=1&docTypes=Civil.Person,Civil.Organisation,Oss.Establishment','http://localhost:65368/#/search/fullscreenresult?domainId=8&index=civil&documentType=Person'];
var imageNames = ['standard.png','fullscreen.png'];

pages.forEach(function(element, index)){
	page.open(elment, function() {
	  page.render(imageNames[index]);
	  phantom.exit();
	});
};

/*
page.open('http://github.com/', function() {
  page.render('github.png');
  phantom.exit();
});*/