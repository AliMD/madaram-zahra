/*jshint strict:true, es5:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, nonew:true, browser:true, devel:true, indent:2, boss:true, curly:false, immed:false, latedef:true, newcap:true, plusplus:false, trailing:true, maxparams:3, maxerr:100, debug:false, asi:false, evil:false, expr:true, eqnull:false, esnext:false, funcscope:false, globalstrict:false, loopfunc:false */
/*global Piwik */

(function($){
  "use strict";

  $.extend($.fn,{
    fadeLoop: function(options){

      options=$.extend({
        duration : 2000,
        delay : 1500,
        startIndex : -1,
        fadeFirstImage : true
      },options);

      var
        pics    =this,
        indx    =options.startIndex,
        plen    =this.length,
        fadeIn  ={opacity:1},
        fadeOut ={opacity:0},
        ease    =!!window.Zepto ? 'ease-in-out' : 'swing',
        nextPic = function(){
          pics.eq(indx).animate(fadeOut,options.duration,ease);
          indx=indx<plen-1?indx+1:0;
          pics.eq(indx).animate(fadeIn,options.duration,ease,function(){
            setTimeout(nextPic,options.delay);
          });
        };
      pics.css(fadeOut);
      options.fadeFirstImage || pics.eq(0).css(fadeIn);
      nextPic();
    }
  });
})(window.Zepto || window.jQuery);

(function($){
  "use strict";

  $(function(){
    $('.bg-holder > figure').fadeLoop();
  });

  // Piwik Analytic
  var
    piwikTracker= Piwik.getTracker();

  piwikTracker.setSiteId(21);
  piwikTracker.setTrackerUrl("http://a.1dws.com/piwik.php");
  piwikTracker.setCookieDomain('*.github.com');
  piwikTracker.enableLinkTracking(true);
  piwikTracker.setCustomVariable(1,'Screen Size',screen.width+'x'+screen.height+'('+window.innerWidth+'x'+window.innerHeight+')','visit');
  piwikTracker.trackPageView('Home page on github');

})(window.Zepto || window.jQuery);