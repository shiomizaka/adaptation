// config
var APP = {
	bp: {
		mobile: 959
	}
};

var CFL = {
  UA: {
    raw: function raw() {
      return navigator.userAgent;
    },
    is: function is(_is) {
      var ua = CFL.UA.raw();
      if (_is === 'issp') {
        return CFL.UA.isSp();
      }
    },
    isSp: function isSp() {
      var ua = CFL.UA.raw();
      return ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0;
    },
    isTablet: function() {
      var ua = CFL.UA.raw();
      if(ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
      } else if (ua.indexOf('iPad') > -1
         || (ua.indexOf('Macintosh') > -1 && CFL.Device.isTouch() )
         || ua.indexOf('Android') > 0) {
        return true;
      }
      var agent = window.navigator.userAgent.toLowerCase();
      var ipad = agent.indexOf('ipad') > -1 || agent.indexOf('macintosh') > -1 && 'ontouchend' in document;
      if(ipad == true){
        return true;
      }
      return false;
    },
    isEdge: function() {
      return this.raw().indexOf('Edge') != -1;
    },
    isIE: function() {
      var ua = CFL.UA.raw();
      return this.raw().indexOf('Trident') != -1 ;
    }
  },
  Device: {
    isTouch: function() {
      return 'ontouchend' in document;
    }
  }
};

var isMobile = function () {
  return (window.matchMedia('(max-width: '+ APP.bp.mobile +'px)').matches)
}

var isPortrait = function() {
  let defaultOrientation = null;
  if('orientation' in window) {
    var o1 = (window.innerWidth < window.innerHeight);
    var o2 = (window.orientation % 180 == 0);
    defaultOrientation = (o1 && o2) || !(o1 || o2);
  }
  if('orientation' in window) {
    // defaultOrientationがtrueの場合、window.orientationが0か180の時は縦
    // defaultOrientationがfalseの場合、window.orientationが-90か90の時は横
    var o = (window.orientation % 180 == 0);
    if((o && defaultOrientation) || !(o || defaultOrientation)) {
      return true;
    } else {
      return false;
    }
  }
}

//# sourceMappingURL=../../_cache/_maps/front.js.map
