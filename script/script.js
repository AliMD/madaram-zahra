/*jshint strict:true, es5:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, nonew:true, browser:true, devel:true, indent:2, boss:true, curly:false, immed:false, latedef:true, newcap:true, plusplus:false, trailing:true, maxparams:3, maxerr:100, debug:false, asi:false, evil:false, expr:true, eqnull:false, esnext:false, funcscope:false, globalstrict:false, loopfunc:false */

/*
 * Madaram Zahra Mobile App v1b
 */

var
  // Easy log
  log= function(x){
    console.log(x);
  };

(function($,undefined){
  "use strict";

  // Application Main Object
  var app = {
    // Application Resources Url
    urls: {
      base: 'file:///android_asset/www/',
      audio: 'audio/'
    },
    // Application Constructor
    initialize: function() {
      this.bindEvents();
    },
    // Log errors 
    error: function(msg) { // log errors
      log('Err : '+(msg['code']?msg.code:msg));
    },
    // Convert audio file name to absolute audio url
    audioUrl: function(fileName){
      return this.urls.base+this.urls.audio+fileName+'.mp3';
    },
    // Bind Event Listeners
    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      document.addEventListener('online', this.online, false);
      document.addEventListener('offline', this.offLine, false);
      document.addEventListener('pause', this.paused, false);
      document.addEventListener('resume', this.resumed, false);
      document.addEventListener('menubutton', this.menuButton, false);
      document.addEventListener('searchbutton', this.searchButton, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
      log('Device Ready');

      app.playAudio('startup');
      app.audioPanel();
    },
    // online Event Handler
    onLine: function(){
      log('Device OnLine');
    },
    // offline Event Handler
    offLine: function(){
      log('Device OffLine');
    },
    // pause Event Handler
    paused: function(){
      log('Device Paused');
    },
    // resume Event Handler
    resumed: function(){
      log('Device Resumed');
    },
    // menubutton Event Handler
    menuButton: function(){
      log('Menu Button Pressed');
    },
    // searchbutton Event Handler
    searchButton: function(){
      log('Search Button Pressed');
    },
    // Media Player Obj
    mediaPlayer: null,
    // Play Background Audio
    playAudio: function(fileName){
      if(this.mediaPlayer){
        this.mediaPlayer.stop();
        this.mediaPlayer.release();
      }
      fileName = this.audioUrl(fileName);
      this.mediaPlayer = new Media(fileName);
      this.mediaPlayer.play();
      log('Play Audio '+fileName);
    },
    // Audio Panel Events for download and play audios
    audioPanel: function () {
      
    },
    // Device file system
    fileSystem: null,
    // Request the persistent file system
    reqFileSystem: function (continueFn) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        app.fileSystem = fileSystem;
        log('fileSystem Ready, rootPath: '+app.fileSystem.root.fullPath);
        continueFn();
      },
      function(evt){
        error('Can not access file system with error code '+evt.target.error.code);
      });
    },
    // check file exist with ajax
    fileExist: function(url,useAjax,success,error){
      log('Check file exist : ' + url + ' with '+ useAjax?'ajax':'cordova' );
      return useAjax ?//if
        $.ajax({
          type: 'HEAD',
          url: url,
          success: success,
          error: error
        }) :// else
        app.fileSystem.root.getFile(url, {create:false}, success, error);
    }

  }; // end app obj

  // start app
  app.initialize();

  // Globalization
  window.app = app;
})(window.jQuery); // bigbang