'use strict';

function isSupportsPassive() {
  // Test via a getter in the options object to see if the passive property is accessed
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {}

  return supportsPassive;
}

function S(options) {

  this._e = {
    y: 0,
    x: 0,
    deltaX: 0,
    deltaY: 0,
    originalEvent: null
  };

  // Options
  this.el = window;
  if (options && options.el) {
    this.el = options.el;
    delete options.el;
  }

  this.options = {
    mouseMultiplier: options.mouseMultiplier || 1,
    touchMultiplier: options.touchMultiplier || 2,
    firefoxMultiplier: options.firefoxMultiplier || 15,
    keyStep: options.keyStep || 120,
    preventTouch: options.preventTouch || false
  };

  this.touchStartX = null;
  this.touchStartY = null;
  this.bodyTouchAction = null;

  this.numListeners = 0;
  this.listeners = [];
  this.initialized = false;

  // Detect interaction type.
  this.hasWheelEvent = 'onwheel' in document;
  this.hasMouseWheelEvent = 'onmousewheel' in document;
  this.hasTouchEvent = 'ontouchstart' in document;
  this.hasTouchWinEvent = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
  this.hasPointerEvent = !!window.navigator.msPointerEnabled;
  this.hasKeyDownEvent = 'onkeydown' in document;
  this.isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

  // Context binding.
  this._onWheel = this._onWheel.bind(this);
  this._onMouseWheel = this._onMouseWheel.bind(this);
  this._onTouchStart = this._onTouchStart.bind(this);
  this._onTouchMove = this._onTouchMove.bind(this);
  this._onKeyDown = this._onKeyDown.bind(this);
}

S.prototype.on = function(f) {
  if(!this.initialized) this._bind();
  this.listeners.push(f);
  this.numListeners = this.listeners.length;
};

S.prototype.off = function(f) {
  this.listeners.splice(f, 1);
  this.numListeners = this.listeners.length;
  if(this.numListeners <= 0) this._unbind();
};

S.prototype.destroy = function() {
  this.numListeners = 0;
  this._unbind();
};

S.prototype._notify = function(e) {
  this._e.x += this._e.deltaX;
  this._e.y += this._e.deltaY;
  this._e.originalEvent = e;

  for(var i = 0; i < this.numListeners; i++) this.listeners[i](this._e);
};

S.prototype._onWheel = function(e) {
  // In Chrome and in Firefox (at least the new one)
  this._e.deltaX = e.wheelDeltaX || e.deltaX * -1;
  this._e.deltaY = e.wheelDeltaY || e.deltaY * -1;

  // for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad
  // real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
  if(this.isFirefox && e.deltaMode == 1) {
    this._e.deltaX *= this.options.firefoxMultiplier;
    this._e.deltaY *= this.options.firefoxMultiplier;
  }

  this._e.deltaX *= this.options.mouseMultiplier;
  this._e.deltaY *= this.options.mouseMultiplier;

  this._notify(e);
};

S.prototype._onMouseWheel = function(e) {
  // In Safari, IE and in Chrome if 'wheel' isn't defined
  this._e.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
  this._e.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

  this._notify(e);
};

S.prototype._onTouchStart = function(e) {
  var t = (e.targetTouches) ? e.targetTouches[0] : e;
  this.touchStartX = t.pageX;
  this.touchStartY = t.pageY;
};

S.prototype._onTouchMove = function(e) {

  if(this.options.preventTouch) {
    e.preventDefault();
  }

  var t = (e.targetTouches) ? e.targetTouches[0] : e;

  this._e.deltaX = (t.pageX - this.touchStartX) * this.options.touchMultiplier;
  this._e.deltaY = (t.pageY - this.touchStartY) * this.options.touchMultiplier;

  this.touchStartX = t.pageX;
  this.touchStartY = t.pageY;

  this._notify(e);
};

S.prototype._onKeyDown = function(e) {
  // 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
  this._e.deltaX = this._e.deltaY = 0;
  switch(e.keyCode) {
    case 37:
      this._e.deltaX = -this.options.keyStep;
      break;
    case 39:
      this._e.deltaX = this.options.keyStep;
      break;
    case 38:
      this._e.deltaY = this.options.keyStep;
      break;
    case 40:
      this._e.deltaY = -this.options.keyStep;
      break;
  }

  // Only notify when we got something new.
  if (this._e.deltaX != 0 && this._e.deltaY != 0) {
    this._notify(e);
  }
};

S.prototype._bind = function() {

  if(this.hasWheelEvent) this.el.addEventListener("wheel", this._onWheel, isSupportsPassive() ? { passive: true } : false);
  if(this.hasMouseWheelEvent) this.el.addEventListener("mousewheel", this._onMouseWheel, isSupportsPassive() ? { passive: true } : false);

  if(this.hasTouchEvent) {
    this.el.addEventListener("touchstart", this._onTouchStart, isSupportsPassive() ? { passive: true } : false);
    this.el.addEventListener("touchmove", this._onTouchMove);
  }

  if(this.hasPointerEvent && this.hasTouchWinEvent) {
    this.bodyTouchAction = this.el.body.style.msTouchAction;
    document.body.style.msTouchAction = "none";
    this.el.addEventListener("MSPointerDown", this._onTouchStart, true);
    this.el.addEventListener("MSPointerMove", this._onTouchMove, true);
  }

  if(this.hasKeyDownEvent) document.addEventListener("keydown", this._onKeyDown);

  this.initialized = true;
};

S.prototype._unbind = function() {

  if(this.hasWheelEvent) this.el.removeEventListener("wheel", this._onWheel);
  if(this.hasMouseWheelEvent) this.el.removeEventListener("mousewheel", this._onMouseWheel);

  if(this.hasTouchEvent) {
    this.el.removeEventListener("touchstart", this._onTouchStart);
    this.el.removeEventListener("touchmove", this._onTouchMove);
  }

  if(this.hasPointerEvent && this.hasTouchWinEvent) {
    document.body.style.msTouchAction = this.bodyTouchAction;
    this.el.removeEventListener("MSPointerDown", this._onTouchStart, true);
    this.el.removeEventListener("MSPointerMove", this._onTouchMove, true);
  }

  if(this.hasKeyDownEvent) document.removeEventListener("keydown", this._onKeyDown);

  this.initialized = false;
};

module.exports = S;
