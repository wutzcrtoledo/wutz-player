/*
 * Copyright (C) 2016 CRTOLEDO.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
var logger = require('./log4Wutz');
var os = require('os');
//var app2WutzAdm = require("./app2wutzAdm");
var fs = require('fs');
var sep = os.platform()==="win32"?"\\":"/";
var wutzEdidFsPath = os.homedir()+sep+".wutz";
window.sessionStorage.setItem("homePath",wutzEdidFsPath);
var configPath = wutzEdidFsPath+sep+"json/config.json";
var catalogPath = wutzEdidFsPath+sep+"json/catalog.json";
var conf;
var serverConfMapp = {"desc": "desc",
                      "email": "email",
                      "id": "bar_id",
                      "idcatalog": "catid",
                      "lat": "latitude",
                      "lon": "longitute",
                      "nombreBar": "nombreBar",
                      "representante": "representante",
                      "songsAllowed": "songsAllowed",
                      "telefono": "telefono"};

var confTemplate = {"bar_id":"",
                    "catid":"",
                    "musicPath":"",
                    "separator":sep,
                    "serverhost":"http://wutz.co.uk",
              //      "serverhost":"http://localhost:8001/WutzAdmin", // TEMP
                    "localProwser":"/bwclient/index.html",
                    "androidAppURL":"/apps/Wutz.apk",
                    "downloadAppURL":"https://build.phonegap.com/apps/2149695",
                    "songsAllowed":-1,
                    "guid":"",
                    "superClient":[],
                    "nombreBar":"",
                    "representante":"",
                    "telefono":"",
                    "email":"",
                    "latitude":"",
                    "longitute":"",
                    "dayToken":"",
                    "desc":""};
    //var config = JSON.parse(fs.readFileSync("json/config.json"));

var login = function(authAcc,callback) {
window.AjaxWAdmin.callService("login",authAcc,"POST",function(result){
      //console.log("I'm back from new Lib["+result.logged+"]");
      callback(result);
  });
};


var register = function(regData,callback) {
  window.AjaxWAdmin.callService("registerBar",regData,"POST",function(result){
      callback(result);
  });
};

var isUserIdAvailable = function(userId, callback){
   window.AjaxWAdmin.callService("isBarAvailable/"+userId,null,"GET",function(result){
        callback({id:userId,available:result.available});
   });
};

var commitBarChanges = function(callback) {
  var sesTkn = window.sessionStorage.getItem("wutzSessToken");
   window.AjaxWAdmin.callService("uploadLocalServerInfo",conf,"POST", sesTkn,function(result){
 //   app2WutzAdm.goPost("uploadLocalServerInfo",conf, function(result){
    //  console.log("I'm back ["+result+"]");
      callback(result);
  });
};

var cleanCatalogPlayList = function(bar,callback) {
  var sesTkn = window.sessionStorage.getItem("wutzSessToken");
  var regData = {catId:bar.idcatalog,token:bar.dayToken};
  window.AjaxWAdmin.callService("cleanCatalog",regData,"POST", sesTkn,function(result){
      callback(result);
  });
};

var requestRecPassword = function(barId,callback) {
  console.log("rec call");
  window.AjaxWAdmin.callService("requestRecoverPassCode/"+barId,null,"POST",function(result){
      callback(result);
  });
};

var sendNewRecPassword = function(barId,code,newPass,callback) {
  var regData = {barId:barId,
                 code:code,
                 newPass:newPass
                };
  window.AjaxWAdmin.callService("sendPassRecoverPassCode",regData,"POST",function(result){
      callback(result);
  });
};

var saveConfigFile = function(conf,callback) {
      fs.createWriteStream(configPath);
      fs.appendFile(configPath, JSON.stringify(conf), function (err) {
                    if (err) {
                      logger.info(err);
                      return
                    }
                   // logger.info("Config Edited");
                    callback(conf);
           });
};


var updateConfig = function(pageBar,callback){
  var genTool = require("./genericTools");
  genTool.mergeMappedJSONObjects(pageBar,confTemplate,serverConfMapp,function(_config){
      //  console.log(_config);
        if(_config.guid === ""){
            _config.guid = generateUUID();
            _config.superClient = [_config.guid];
        }
        saveConfigFile(_config, function(_savedConfig){
              if(_savedConfig){
                    conf = _savedConfig;
                    callback(true);
              }
              else
                    callback(false);
        });
  });
};


var isThereCatalogFileLoaded = function(callback){
  //  console.log("Bar Admin Right here");
    if (fs.existsSync(catalogPath)) {
        callback(true);
    }
    else
      callback(false);
};


var generateUUID = function(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

module.exports = {
  saveConfigFile: saveConfigFile,
  updateConfig: updateConfig,
  commitBarChanges: commitBarChanges,
  register: register,
  login : login,
  isThereCatalogFileLoaded: isThereCatalogFileLoaded,
  isUserIdAvailable: isUserIdAvailable,
  cleanCatalogPlayList: cleanCatalogPlayList,
  requestRecPassword:requestRecPassword,
  sendNewRecPassword:sendNewRecPassword
};
