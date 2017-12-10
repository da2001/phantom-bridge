
////////////////////////////////////////////////////////////////////////////
////// SET IP of your devialet bridge here to identify the right device ////

var devialet_ipaddress = "192.168.0.9";
var discoverInterval = 10000; //milliseconds

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

var ssdp = require('node-ssdp').Client, client = new ssdp(), http = require('http'), url = require('url'), request = require('request'), actVol=0, actualDevice = []; 

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true).query;
  
  if(q.setVol && parseInt(q.setVol, 10) > 0)
  {
  	var txt = setVol(q.setVol);
  	actVol=parseInt(q.setVol);
  } 
  else if(q.setVol == "up")
  {
  	actVol = actVol+5;
  	if(actVol > 100)
  	{
  		actVol=100;
  	}
  	var txt = setVol(actVol);
  }
  else if(q.setVol == "down")
  {
  	actVol = actVol-5;
  	if(actVol < 0)
  	{
  		actVol=0;
  	}
  	var txt = setVol(actVol);
  }
  else
  {
  	var txt = "No command set";
  }
  
  res.end(txt);
}).listen(8080);

client.on('response', function inResponse(headers, code, rinfo) {
	if(rinfo.address == devialet_ipaddress)
	{
		actualDevice["host"] = parseUri(headers.LOCATION).host;
		actualDevice["port"] = parseUri(headers.LOCATION).port;
	}
})

function setVol(val)
{
	if(!actualDevice["host"])
	{
		var status =  "Sorry: Speakers not found yet. Try later..";
	}
	else
	{
		var status = "Set Volume to: "+val+"%";
		var xml = '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'+
						  '<s:Body>'+
						     '<u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:2">'+
						       '<InstanceID>0</InstanceID>'+
						        '<Channel>Master</Channel>'+
						        '<DesiredVolume>'+val+'</DesiredVolume>'+
						     '</u:SetVolume>'+
						  '</s:Body>'+
						'</s:Envelope>';
		
		var http_options = {
		  hostname: actualDevice["host"],
		  port: actualDevice["port"],
		  path: '/Control/LibRygelRenderer/RygelRenderingControl',
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'SOAPACTION': 'urn:schemas-upnp-org:service:RenderingControl:2#SetVolume',
		    'Content-Length': xml.length
		  }
		}
		
		var req = http.request(http_options, (res) => {
		  res.setEncoding('utf8');
		});
		 
		req.on('error', (e) => {
		  console.log(`problem with request: ${e.message}`);
		});
		
		req.write(xml); 
		req.end();	
	}
	
	console.log(status);
	return status;
}

function searchSpeaker()
{
	client.search('urn:schemas-upnp-org:service:RenderingControl:2');
	setTimeout(function() {
  searchSpeaker();
	}, discoverInterval);	
	
	if(actualDevice["host"])
	{
		console.log("Devialet bridge found at: "+actualDevice["host"]+":"+actualDevice["port"]);
	}	
}
console.log("Searching for Devialet Bridge...") 
console.log("Please wait a minute until you try to change the volume.");
searchSpeaker();


function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};