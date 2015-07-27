phantomjs rasterize.js "http://localhost:65368/index.html#/?searchString=peter&page=1&docTypes=Civil.Person,Civil.Organisation,Oss.Establishment" standard.png
REM phantomjs rasterize.js "http://localhost:65368/index.html#/?searchString=peter&page=1&docTypes=Civil.Person,Civil.Organisation,Oss.Establishment" standard.png
REM phantomjs rasterize.js "http://localhost:65368/#/search/fullscreenresult?domainId=8&index=civil&documentType=Person" fullscreen.png

TODO : 
REM 1 - Take screenshots are required
REM 2 - Compare current (V1) to new (V2)
REM 3 - Create HTML with V1 + V2 + Differences if present, else OK image
REM 4 - Email the HTML file