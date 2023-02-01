/*
    O-R-G inc.

    windowfull object
    screenfull.js shim for iOS safari
    see https://github.com/sindresorhus/screenfull.js/

    windowfull.js copied from https://www.stuart-bertolotti-bailey.org/
*/

(function () {
  'use strict';

  var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
  var isCommonjs = typeof module !== 'undefined' && module.exports;
  var fullwindow = document.getElementById('fullwindow');

  var content = document.getElementById('content');
  var footer = document.getElementsByTagName('footer')[0];

  document.body.style.position = 'relative';  /* reqd ios overflow: hidden */

  var windowfull = {
      request: function (element) {
          document.body.style.overflow = 'hidden';
          footer.style.display = 'none';
          fullwindow.style.display = 'block';
          content.classList.toggle('edge-fade');
          element.classList.toggle('fullwindow');
          element.style.objectPosition = 'center center';
      },
      exit: function (element) {
          document.body.style.overflow = '';
          footer.style.display = '';
          fullwindow.style.display = 'none';
          content.classList.toggle('edge-fade');
          element.classList.toggle('fullwindow');
          element.style.objectPosition = '';
      },
      toggle: function (element) {
          return this.isFullwindow ? this.exit(element) : this.request(element);
      }
  };

  Object.defineProperties(windowfull, {
      isFullwindow: {
          get: function () {
              // check if currently fullwindow
              // (by presence of class?
              // or presence of div)
              // return true;
              // return Boolean(document[fn.fullscreenElement]);
              // return Boolean(!(document.getElementById('fullwindow')));
              // return Boolean(document.getElementById('fullwindow'));
              return Boolean(fullwindow.style.display == 'block');
          }
      }
  });

  if (isCommonjs) {
      module.exports = windowfull;
  } else {
      window.windowfull = windowfull;
  }
})();


var imgs = document.querySelectorAll('img,video');
var i;
for (i = 0; i < imgs.length; i++) {
//   console.log('screenfull');
  imgs[i].addEventListener('click', function () {
    windowfull.toggle(this);
  }, false);
}