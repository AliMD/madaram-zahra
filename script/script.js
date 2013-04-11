(function(){
  var
    onLoad = function(){ // win onload
      document.addEventListener("deviceready", init, false);
    },

    fail = function(evt) { // log errors
      console.log(evt.target.error.code);
    },

    init = function(){ // deviceready 
      var
        fileExist = function(url){ // check file exist
          return false;
        };

      alert(fileExist());
    };

  setTimeout(function(){
    window.scrollTo(0,1);
  },1);

})(); // bigbang