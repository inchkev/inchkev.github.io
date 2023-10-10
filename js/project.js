/*
 * Kevin Chen
 *
 * portions from windowfull.js from https://www.stuart-bertolotti-bailey.org/
*/

(function () {
  'use strict';

  var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
  var isCommonjs = typeof module !== 'undefined' && module.exports;

  // var content = document.getElementById('content');
  // var footer = document.getElementsByTagName('footer')[0];
  var fullwindowDiv = undefined;

  var windowfull = {
    full: function (element) {
      fullwindowDiv = document.createElement('div');
      const img = new Image(element.width, element.height);
      img.src = element.src;
      img.alt = element.alt;

      const imgRect = element.getBoundingClientRect();
      const imgLeft = imgRect.left;
      const imgTop = imgRect.top;
      const imgWidth = imgRect.width;
      const imgHeight = imgRect.height;
      const aspectRatio = element.width / element.height;

      element.style.opacity = 0;
      fullwindowDiv.appendChild(img);
      fullwindowDiv.classList.add('fullscreen', 'nomaxheight');
      document.body.appendChild(fullwindowDiv);

      // set initial position and size for image
      img.style.position = 'fixed';
      img.style.left = `${imgLeft}px`;
      img.style.top = `${imgTop}px`;
      img.style.width = `${imgWidth}px`;
      img.style.height = `${imgHeight}px`;

      const windowAspectRatio = window.innerWidth / window.innerHeight;
      const scale = (windowAspectRatio > aspectRatio) ?
        window.innerHeight / imgHeight : window.innerWidth / imgWidth;
      const translateX = (window.innerWidth - imgWidth) / 2 - imgLeft;
      const translateY = (window.innerHeight - imgHeight) / 2 - imgTop;

      setTimeout(() => {
        img.style.transition = 'transform 0.25s cubic-bezier(.4,0,.22,1)';
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        fullwindowDiv.classList.add('fade');
        img.style.cursor = 'zoom-out';
        fullwindowDiv.style.cursor = 'zoom-out';
        setTimeout(() => {
          img.style.position = '';
          img.style.left = '';
          img.style.top = '';
          img.style.width = '';
          img.style.height = '';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.transition = '';
          img.style.transform = '';

          fullwindowDiv.addEventListener('click', function () {
            windowfull.toggle(element);
          }, { once: true });
        }, 250);
      }, 20);
    },

    exit: function (element) {
      const img = fullwindowDiv.querySelector('img');

      // set initial position
      const srcImgRect = img.getBoundingClientRect();
      img.style.position = 'fixed';
      img.style.left = `${srcImgRect.left}px`;
      img.style.top = `${srcImgRect.top}px`;
      img.style.width = `${srcImgRect.width}px`;
      img.style.height = `${srcImgRect.height}px`;
      img.style.maxWidth = '';
      img.style.maxHeight = '';

      const dstImgRect = element.getBoundingClientRect();
      const imgLeft = dstImgRect.left;
      const imgTop = dstImgRect.top;
      const imgWidth = dstImgRect.width;
      const imgHeight = dstImgRect.height;
      const aspectRatio = element.width / element.height;

      const windowAspectRatio = window.innerWidth / window.innerHeight;
      const scale = (windowAspectRatio > aspectRatio) ?
        imgHeight / window.innerHeight : imgWidth / window.innerWidth;
      const translateX = (window.innerWidth - imgWidth) / 2 - imgLeft;
      const translateY = (window.innerHeight - imgHeight) / 2 - imgTop;

      fullwindowDiv.style.backgroundColor = 'transparent';
      img.style.transition = 'transform 0.2s cubic-bezier(.4,0,.22,1)';
      img.style.transform = `translate(${-translateX}px, ${-translateY}px) scale(${scale})`;
      setTimeout(() => {
        document.body.removeChild(fullwindowDiv);
        fullwindowDiv = undefined;
        element.style.opacity = '';
      }, 200);
    },
    
    toggle: function (element) {
      return (fullwindowDiv) ? this.exit(element) : this.full(element);
    }
  };

  if (isCommonjs) {
    module.exports = windowfull;
  } else {
    window.windowfull = windowfull;
  }
})();


var imgs = document.querySelectorAll('img');
for (const img of imgs) {
  img.addEventListener('click', function () {
    windowfull.toggle(this);
  });
}
