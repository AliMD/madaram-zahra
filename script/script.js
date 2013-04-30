/*jshint strict:true, es5:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, nonew:true, browser:true, devel:true, indent:2, boss:true, curly:false, immed:false, latedef:true, newcap:true, plusplus:false, trailing:true, maxparams:4, maxerr:100, debug:false, asi:false, evil:false, expr:true, eqnull:false, esnext:false, funcscope:false, globalstrict:false, loopfunc:false */
/*global Media, FileTransfer, requestFileSystem, Piwik, device, LocalFileSystem */

/*
 * Madaram Zahra Mobile App v1rc1
 */

(function($,undefined){
  "use strict";

  // Global Objects
  var
    // Easy log
    log = function(x){
      console.log(x);
    };

  // Application Main Object
  var app = {
    // Application Resources Url
    urls: {
      www: 'file:///android_asset/www/',
      startAudio: 'audio/startup.mp3',
      root: '',
      external: 'Madaram_Zahra/',
      server: 'http://1dws.com/demo/madaramzahra/downloads/',
      piwikImg: 'http://a.1dws.com/piwik.php?idsite=21&rec=1&action_name='
    },
    // Application Constructor
    initialize: function() {
      this.bindEvents();
    },
    // Log errors 
    error: function(msg) { // log errors
      log('Err : '+(msg['code']?msg.code:msg));
    },
    beep: function (t) {
      t=t>0?t:1;
      navigator.notification.beep(t);
    },
    // Convert audio file name to absolute audio url
    audioUrl: function(fileName,relative){
      return !fileName?
        this.urls.www+this.urls.startAudio :
        (relative?'':this.urls.root)+this.urls.external+fileName +'.mp3';
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
      if(!app.extDirEntry) return app.makeExtDir(app.onDeviceReady);
      app.playAudio();
      app.audioPanel();
      app.analytic();
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
      //app.audioPause();
      log('Device Paused');
    },
    // resume Event Handler
    resumed: function(){
      //app.audioPlay();
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
    // Media Player status
    playing: false,
    // Play Background Audio
    playAudio: function(fileName){
      if(this.mediaPlayer){
        this.mediaPlayer.stop();
        this.mediaPlayer.release();
        this.playing=false;
      }
      fileName = this.audioUrl(fileName);
      this.mediaPlayer = new Media(fileName);
      this.audioPlay();
      log('Play Audio '+fileName);
    },
    // Media Player Stop
    audioPause: function () {
      this.playing && this.mediaPlayer && this.mediaPlayer.pause();
      this.playing = false;
    },
    // Media Player Stop
    audioPlay: function () {
      this.playing || this.mediaPlayer && this.mediaPlayer.play();
      this.playing = true;
    },
    // Audio Panel Events for download and play audios
    audioPanel: function () {
      // Fix icons
      var
        $audioLinks = $('a[data-audio]'),
        $playBtns = $('[data-role=header] a.pause'),
        downClass = 'downloaded',
        waitClass = 'loading',
        lastTap = Date.now();

      $playBtns.tap(function(){
        var now = Date.now();
        if(now-lastTap<1000) return false;
        lastTap = now;

        if(app.playing){
          $playBtns.removeClass('pause');
          $playBtns.addClass('play');
          app.audioPause();
        }else{
          $playBtns.removeClass('play');
          $playBtns.addClass('pause');
          app.audioPlay();
        }
      });

      $audioLinks.each(function(){
        var
          $that = $(this),
          audioName = $that.data('audio').toLowerCase(),
          title = $that.html();

        $that.html('<i class="icon-play-circle"></i><i class="icon-download-alt"></i><i class="icon-refresh icon-spin"></i>'+title);

        app.fileExist(app.audioUrl(audioName,true),false,
          function(){
            log('Audio finded: '+audioName);
            $that.addClass(downClass);
          }
        );

        $that.tap(function(){
          var now = Date.now();
          if(now-lastTap<1000) return false;
          lastTap = now;

          if($that.hasClass(downClass)){
            app.playAudio(audioName);
          }else if($that.hasClass(waitClass)){
            navigator.notification.alert('فایل در حال دانلود است، لطفا شکیبا باشید', function () {}, 'شکیبا باشید', 'چشم');
          }else{
            navigator.notification.confirm('آیا مایل به دانلود این فایل هستید ؟', function (btn) {
              if(btn===1){
                $that.addClass(waitClass);
                app.downloadAudio(audioName,
                  function () {
                    $that.removeClass(waitClass);
                    $that.addClass(downClass);
                    app.playAudio(audioName);
                  },
                  function () {
                    $that.removeClass(waitClass);
                    navigator.notification.alert('خطا در دانلود فایل !', function () {}, 'خطا', 'خب');
                  }
                );
              }
            }, 'دانلود', 'بلی,خیر');
          }
        });
      });
    },
    // Device file system
    fileSystem: null,
    // Request the persistent file system
    reqFileSystem: function (continueFn) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
          app.fileSystem= fileSystem;
          app.urls.root= app.fileSystem.root.fullPath+'/';
          log('fileSystem Ready, rootPath: '+app.urls.root);
          continueFn();
        },
        function(evt){
          app.error('Can not access file system with error code '+evt.target.error.code);
        }
      );
    },
    // urls.external DirectoryEntry
    extDirEntry: null,
    // Make external directory and assign extDirEntry
    makeExtDir: function (continueFn) {
      if(app.extDirEntry) return false;
      if (!app.fileSystem)
        return app.reqFileSystem(function(){
          app.makeExtDir(continueFn);
        });
      log('Making "'+app.urls.external+'" directory');
      app.fileSystem.root.getDirectory(app.urls.external, {create: true, exclusive: false}, function(entry){
        app.extDirEntry=entry;
        log('Access '+app.extDirEntry.fullPath);
        continueFn();
      }, app.error);
    },
    // check file exist with ajax
    fileExist: function(url,useAjax,success,error){
      log('Check file exist : ' +url +' with ' +(useAjax?'ajax':'cordova'));
      return useAjax ?//if
        $.ajax({
          type: 'HEAD',
          url: url,
          success: success,
          error: error
        }) :// else
        app.fileSystem.root.getFile(url, {create:false}, success, error);
    },
    // File Transfer Opject for downloads files
    fileTransfer: null,
    // Download audio file frome server
    downloadAudio: function(fileName,success,error){
      app.downloadFile(app.urls.server+fileName+'.mp3',app.urls.root+app.urls.external+fileName+'.mp3',
        function(){
          app.downloadFile(app.urls.piwikImg+'Download+'+fileName,app.urls.root+app.urls.external+'tmp.jpg',
            function(){
              log('Piwik register download '+fileName);
            },
            function(evt){
              log('Download piwik img error!, code '+evt['code']);
            }
          );
          success();
        },
        function (evt) {
          app.error('Download Error, code '+evt['code']);
          error && error();
        }
      );
    },
    // Download file from server
    downloadFile: function (url,dest,success,error) {
      if(!app.fileTransfer) app.fileTransfer= new FileTransfer();
      log('Downloading: '+url);
      app.fileTransfer.download(encodeURI(url),dest,success,error,true);
    },
    // 1Devs PIWIK Analytic
    piwikTracker: Piwik.getTracker(),
    analytic: function () {
      this.piwikTracker.setSiteId(21);
      this.piwikTracker.setTrackerUrl("http://a.1dws.com/piwik.php");
      this.piwikTracker.setCookieDomain('*.1dws.com');
      //this.piwikTracker.enableLinkTracking(true);
      this.piwikTracker.setCustomVariable(1,'Device UUID',device.uuid,'visit');
      this.piwikTracker.setCustomVariable(2,'Device Model',device.model,'visit');
      this.piwikTracker.setCustomVariable(3,'Device Version',device.version,'visit');
      this.piwikTracker.setCustomVariable(4,'Screen Size',screen.width+'x'+screen.height+'('+window.innerWidth+'x'+window.innerHeight+')','visit');
      this.piwikTracker.trackPageView('Madaram Zahra v1.0 main page');
      log('Pwik!');
    }

  }; // end app obj

  // start app
  app.initialize();

  // Globalization
  window.app = app;
})(window.jQuery); // bigbang