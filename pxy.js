// url rewriter
// Unclephil 2011  tc.unclephil.net
// ================================
// Derived from well knowed http-proxy.js
// ========================================
var http = require('http');
var sys  = require('sys');
var fs   = require('fs');

// CONFIGURATION
// this section contains message
var msgErrorHeader = "My beautiful Rewriter\nIt seems that we have a problem\nPlease contact our Helpdesk\n";
var msgIpNotAllowed = "is not allowed to use this proxy";
var msgErrorReadConfig = "Error during config file access";
var msgErrorReadBlacklist = "";
var msgErrorHostNotDefined = "is not in the configuration file";

//this section contains config
var cfgresturl = './rwconfx';
var cfgport = 8080;

//END CONFIGURATION

var configlist = [];
var iplist    = [];

//watch config files , with this rewriter never stopp working
// if config files are not present, server is crashing 
//
fs.watchFile('./configlist', function(c,p) { update_configlist(); });
fs.watchFile('./iplist', function(c,p) { update_iplist(); });

function update_configlist() {
  configlist = fs.readFileSync('./configlist',encoding='UTF8').split('\n');
}

function update_iplist() {
  iplist = fs.readFileSync('./iplist',encoding='UTF8').split('\n')
           .filter(function(rx) { return rx.length });
}

//Blacklist
function ip_rejected(ip) {
  for (i in iplist) {
    if (iplist[i] == ip) {
      return true;
    }
  }
  return false;
}

//Match requested url and return Destination
function rewrite_host(host) {
  for (i in configlist) {
    if (configlist[i].split(',')[0]== host) {
      return configlist[i].split(',')[1];
    }
  }
  return "";
}

//send error screen
function deny(response, msg, code) {
  response.writeHead(code);
  response.write(msgErrorHeader);
  response.write(msg+"\n");
  response.write((new Date).toGMTString()+"\n");
  response.end();
  sys.log(msg);
}

update_configlist();
update_iplist();
sys.log("Rewriter starting");
http.createServer(function(request, response) {
  var ip = request.headers['x-real-ip'];
  var url = '.'+request.url;
  if (ip_rejected(ip)) {
    msg = "IP " + ip + " " +msgIpNotAllowed;
    deny(response, msg, "401");
    sys.log(msg);
    return;
  }
  sys.log(url);
  if (url == cfgresturl){
    fs.readFile('./configlist', function(error, content) {
        if (error) {
             msg = msgErrorReadConfig;
             deny(response, msg, "500");
             return;
        }
        else {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end(content, 'utf-8');
            return;
        }
     });
  }
  else {
    oldloc = request.headers['host']
    newloc = rewrite_host(oldloc);
    if (newloc=="") {
      msg = oldloc + " "+msgErrorHostNotDefined;
      deny(response, msg,"404");
      sys.log(ip+": "+msg);
      return;
    }
    else {
      sys.log(ip + ": " + request.method + " " + oldloc +" to "+newloc);
      response.writeHead(301,{'Location':newloc, 'Expires': (new Date).toGMTString()});
      response.end();
    }
  }
}).listen(cfgport);
