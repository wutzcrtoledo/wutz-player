function AppViewModel() {
    
   //Observable Definitions 
    mainMod = this;
    mainMod.playList = ko.observableArray([]); 
    mainMod.filePlaying = ko.observable();
    
    //mainMod.picMap = ko.observable({"others":"./img/fronts/defaultSong.png"});
    
//Start checking audio
var config = null;
var homePath = window.sessionStorage.getItem("homePath");
var logger = require('./js/lib/log4Wutz');
var ipc = require('electron').ipcRenderer;

var brokenSongs = [];

$(document).ready(function() {
    
    $.getJSON( homePath+"/json/config.json", function(_config) {
        
       // var qrUrl = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+_config.downloadAppURL+"&v="+Math.random();
       // $("#qrAppImg").attr("src",qrUrl);
        config = _config;
        var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params = JSON.stringify(params);
        
        $.ajax({
		type: 'POST',
		dataType: 'json',
                url: config.serverhost+"/rescuePendingList",
		data: params,
		success: function (result) {
			mainMod.loadFullCatalog();
                        mainMod.checkEmptyList();
                        var inter = setInterval(function(){
                          mainMod.loadFullCatalog();
                        }, 10000 );
		},
		error: function (xhr, txtStat, errThrown) {
			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
		}
       });
    });
});

     
// -------------   Functions from previous ver
this.loadAndPlayRandomSong = function(){
    
      var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params.songId = "-1";
        params.guid = config.guid;
        params = JSON.stringify(params);
        
       $.ajax({
		type: 'POST',
		dataType: 'json',
		url: config.serverhost+"/addSongToQueue",
		data: params,
		success: function (result) {
			if(result.added !== "OK")
                        {
                            logger.info("Falla al cargar tema random");
                        }
		},
		error: function (xhr, txtStat, errThrown) {
			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
};

this.loadAndPlaySong = function(song){
   
    try{
      
      if($.inArray(song.songid,brokenSongs) === -1){       
        $("#"+song.songid).get(0).play();        
        mainMod.songChecker($("#"+song.songid).get(0));
      }
      else{
          logger.info("ERROR LOADING SONG : ["+song.songid+"]");
          mainMod.goNextQueue();
      }
    }catch(err){
        logger.info("ERROR LOADING SONG : ["+err+"]");
        mainMod.goNextQueue();
    }
};


/**
this.loadAndPlaySongReturn = function(result){
    
    $("#"+result.songid).get(0).play();
    mainMod.songChecker($("#"+result.songid).get(0));
};
**/

this.songChecker = function(audioMedia){
   
   var inter = setInterval(function()
    {
        if(audioMedia.ended)
        {
            clearInterval ( inter );
            logger.info("Song Ended");
            if(mainMod.playList().length > 0)
                mainMod.goNextQueue();
            else{
                mainMod.checkEmptyList();
                mainMod.loadAndPlayRandomSong();
            }
                
        }
    }, 1000 );
};

this.goNextQueue = function(){
    
    //comingfromArrow = comingfromArrow?true:false;
   //if($("#playList").children().size() > 1)
   if(mainMod.playList().length > 1) {
      var newRow = $(".playingRow").next();
        $(".playingRow").remove();
        mainMod.removeSongFromPlaylist(mainMod.playList()[0].songid,mainMod.playList()[0].client_guid);
        mainMod.playList.shift();
        newRow.addClass("playingRow");
     //   var songId = mainMod.playList()[0].songid;//$(".playingRow #songId").attr("value");
        mainMod.loadAndPlaySong(mainMod.playList()[0]);
   }
   else {
      $(".playingRow").remove();
      mainMod.removeSongFromPlaylist(mainMod.playList()[0].songid,mainMod.playList()[0].client_guid);
      mainMod.playList.removeAll();
      mainMod.checkEmptyList();
      mainMod.loadAndPlayRandomSong();
   }
   //if(!comingfromArrow)
    $("[data-carousel-3d] [data-next-button]").click();
};

this.removeSongFromPlaylist= function(songid,clientGuid){
    var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params.songId = songid;
        params.guid = clientGuid;
        params = JSON.stringify(params);
    $.ajax({
		type: 'POST',
		dataType: 'json',
		url: config.serverhost+"/unqueueSong",
		data: params,
		success: function (result) {
                       if(result)
                            logger.info("LastSongRem");
                       else
                           logger.info("NoSongRemoved");
		},
		error: function (xhr, txtStat, errThrown) {
			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
};

this.startQueue = function(){
    
      //var songId = $("#playList tr:first #songId").attr("value");
      //var songId = mainMod.playList()[0].songid;
      $("#playList tr:first").addClass("playingRow");
      mainMod.loadAndPlaySong(mainMod.playList()[0]);
};

this.loadFullCatalog = function(){
    
    var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params = JSON.stringify(params);
        
      $.ajax({
		type: 'POST',
		dataType: 'json',
		url: config.serverhost+"/getFullCatalog",
		data: params,
		success: function (result) {
			mainMod.loadFullCatalogReturn(result);
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
};

this.loadFullCatalogReturn = function(jsonRes){
    
    //var firstOne = true;
    var mp3t = require('./js/lib/mp3Tools');
    
    var areNewSongs = false;
    $.each(jsonRes,function(i, value)
    {
         areNewSongs = true;
         tempSong = value;
       //  tempSong.pic = "";
        // mainMod.picMap()[tempSong.songid] = "./img/fronts/defaultSong.png";
        // var fileName = "./audio/currSong.mp3?rv"+Math.random(); 
        var filPath = tempSong.file_path;
        var filName = tempSong.file_name;  
        var fileName = filPath+"/"+filName;
         var audioHtml = "<audio class=\"audio\" id=\""+tempSong.songid+"\" controls preload=\"none\"> ";
             audioHtml += "<source src=\""+fileName+"\" type=\"audio/mpeg\">";
             audioHtml += "</audio>";
         tempSong.htmlAudioObject = audioHtml;
         mainMod.playList.push(tempSong);
        mp3t.loadFrontAlbumPic(tempSong, function(song){
            //tempSong.pic =  imgPath;
            if(song.err === undefined)
                $("#cont_"+song.songid+" img").attr("src",song.pic);
            else{
                logger.info("Song With Issues : "+song.songid+"["+song.file_name+"]["+song.exc+"]");
                brokenSongs.push(song.songid);
              //  mainMod.removeSongFromPlaylist(song.songid,song.client_guid)
            }
        });
        
     });
     if(areNewSongs){
                $("[data-carousel-3d]").html($("#cleanCarousel").html());
                 var tmp = $("#carouselImp");
                $("#carouselImp").remove();
                $("body").append(tmp);
                $("[data-prev-button]").hide();
                $(".sliderCol span").textSlider();
    }
};

    this.checkEmptyList = function(){

        var inter = setInterval(function()
        {
            if($("#playList").children().size() > 0)
            {
                clearInterval ( inter );
                mainMod.startQueue();
            }
        }, 3000 );
    };


    this.toogleHeaderMenu = function(data, event){
        
        console.log("Mouse ["+event.pageX+"]["+event.pageY+"]");
        var menuObj = $("#headerMenu");
        if(menuObj.css("width") === "0px"){
            //menuObj.offset({left:event.pageX,top:event.pageY});
            menuObj.animate({width:"300px"},1000);
            //menuObj.fadeIn("slow");
        }
        else{
            menuObj.animate({width:"0px"},1000);
            //menuObj.fadeOut("slow");
        }
    };
    
    this.exitPlayer = function(){
        
        document.location = "./login_reg.html";
        
    };
    
    /**
    this.setFullScreen = function(){
       modul = this;
       console.log("Setting Full Screen");
      // var element = document.getElementById("mainContainer");
       var element = document.body;
          if (element.requestFullscreen)
              element.requestFullscreen();
          else if (element.msRequestFullscreen)
              element.msRequestFullscreen();
          else if (element.mozRequestFullScreen)
              element.mozRequestFullScreen();
          else if (element.webkitRequestFullscreen)
              element.webkitRequestFullscreen();
          
          element.style.display='none';
          element.offsetHeight; // no need to store this anywhere, the reference is enough
          element.style.display='';
         // element.style.webkitTransform = 'scale(1)';
         // modul.refreshCssFiles();
          
     };
     **/
    
     this.setFullScreen = function(){
        
        var mod = this;
        var menuObj = $("#headerMenu");
        menuObj.animate({width:"0px"},1000);
        ipc.sendSync('toogFullScreen');
        
          $(document).keyup(function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                mod.setFullScreen();
            }
           });
        
     };
    
    
    this.refreshCssFiles = function(){
        
        var linkTemplate = "<link rel=\"stylesheet\" type=\"text/css\" />";
        $("link", "head").each(function(i){
            var tempCssLink = $(this).attr("href");
            var newCss = $(linkTemplate);
            newCss.attr("href",tempCssLink);
            $(this).remove();
            $("body").append(newCss);
        });
    };
};

// Activates knockout.js
var viewModel = new AppViewModel();
ko.applyBindings(viewModel);