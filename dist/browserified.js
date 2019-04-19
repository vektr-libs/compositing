(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var lr = ALLEX.execSuite.libRegistry;
lr.register('vektr_compositinglib',
  require('./index')(
    ALLEX,
    lr.get('allex_hierarchymixinslib'),
    lr.get('vektr_commonlib'),
    lr.get('vektr_renderinglib'),
    lr.get('vektr_loaderlib')
  )
);

},{"./index":2}],2:[function(require,module,exports){
function createLib (execlib, hierarchymixinslib, commonlib, renderinglib, loaderlib) {
  'use strict';

  var lib = execlib.lib;
  var ret = {};

  require('./src/RenderingParentcreator')(lib, hierarchymixinslib, renderinglib, ret);
  require('./src/Theatercreator')(lib, hierarchymixinslib, commonlib, renderinglib, loaderlib, ret);

  return ret;
}

module.exports = createLib;

},{"./src/RenderingParentcreator":3,"./src/Theatercreator":4}],3:[function(require,module,exports){
function createRenderingParent(lib,hierarchymixinslib,renderinglib,mylib){
  'use strict';
  function RenderingParent(){
    this.dirty = false;
    lib.Changeable.call(this);
    lib.Settable.call(this);
    lib.Gettable.call(this);
    hierarchymixinslib.Parent.call(this);
  }
  lib.inherit(RenderingParent,hierarchymixinslib.Parent);
  RenderingParent.prototype.__cleanUp = function(){
    hierarchymixinslib.Parent.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Settable.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
    this.dirty = null;
  };
  RenderingParent.prototype.get = lib.Gettable.prototype.get;
  RenderingParent.prototype.set = lib.Changeable.prototype.set;
  RenderingParent.prototype.fireEvent = lib.Changeable.prototype.fireEvent;
  RenderingParent.prototype.addChild = function(chld){
    hierarchymixinslib.Parent.prototype.addChild.call(this,chld);
    this.set('dirty',true);
  };
  RenderingParent.prototype.removeChild = function(chld){
    hierarchymixinslib.Parent.prototype.removeChild.call(this,chld);
    this.set('dirty',true);
  };
  RenderingParent.prototype.invalidate = function(){
    this.dirty = true;
    if (!this.__parent) return;
    this.__parent.childChanged(this);
  };
  RenderingParent.prototype.childChanged = function(chld){
    if(!this.dirty){
      this.invalidate();
    }
  };
  RenderingParent.prototype.render = function(){
    this.dirty = false;
  };
  mylib.RenderingParent = RenderingParent;
}

module.exports = createRenderingParent;

},{}],4:[function(require,module,exports){
function createTheater(lib,hierarchymixinslib,commonlib,renderinglib,loaderlib,mylib){
  'use strict';
  function defaultRequestAnimationFrame(callback) {
    lib.runNext(callback, 1000 / 60);
  }
  var _requestAnimFrame = window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      defaultRequestAnimationFrame;

  var _cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  var _renderHandle = null,
    _inRender = false;
  function renderScene(dirtyobj,scene){
    if(scene.dirty){
      dirtyobj.dirty = true;
    }
    if (dirtyobj.dirty) {
      scene.render();
    }
  }
  var _aboutToRender = new lib.HookCollection();
  mylib.aboutToRender = _aboutToRender;
  function renderTheater(){
    var dirtyobj = {dirty:false};
    _renderHandle = null;
    _inRender = true;
    _aboutToRender.fire();
    _theater.__children.traverse(renderScene.bind(null,dirtyobj));

    if(dirtyobj.dirty && !_renderHandle){
      _renderHandle = _requestAnimFrame(renderTheater);
    }
    _inRender = false;
  }

  function flushScene (scene) {
    scene.flush();
  }

  function goRender(){
    if(_renderHandle !== null){return;}
    if(_inRender) {return;}
    _renderHandle = _requestAnimFrame(renderTheater);
  }

  function Theater(){
    lib.Destroyable.call(this);
    lib.Gettable.call(this);
    hierarchymixinslib.Parent.call(this);
    lib.Changeable.call(this);
    lib.Listenable.call(this);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  lib.inherit(Theater,hierarchymixinslib.Parent);
  Theater.prototype.__cleanUp = function(){
    this.ctx = null;
    this.canvas = null;
    lib.Listenable.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
    hierarchymixinslib.Parent.prototype.__cleanUp.call(this);
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  Theater.prototype.attachListener = lib.Listenable.prototype.attachListener;
  Theater.prototype.childChanged = function(canvas){
    goRender();
  };
  Theater.prototype.onRenderingSvg = function(controllerctor,cb, svgurl,svg){
    /*
    var ctor = controllerctor||controllerslib.SVGInstantiator;
    if (!(ctor.prototype instanceof controllerslib.SVGInstantiator)) {
      throw new Error ('SVG ctor MUST be instanceof controllerslib.SVGInstantiator');
    }
    */
    if (!lib.isFunction(controllerctor)) {
      throw new Error ('SVG ctor MUST be a Function');
    }
    if(svg){
      cb(new controllerctor(svgurl, svg,[]));
    }else{
      //TODO: cek, ako nema svg-a, onda nesto puklo?
      cb(null);
    }
  };
  Theater.prototype.produceSvgController = function(controllerctor, svgpath, cb, storagesvg){
    ///TODO: svgpath vs. storagesvg
    if(storagesvg){
      storagesvg.display = false;
      new renderinglib.Svg(this,storagesvg,this,this.onRenderingSvg.bind(this,controllerctor, cb, svgpath));
    }else{
      this.onRenderingSvg(controllerctor,cb, svgpath, null);
    }
  };
  Theater.prototype.get_visible = function(){
    return true;
  };
  Theater.prototype.scene = renderinglib.SvgParent.prototype.childById;
  Theater.prototype.addChild = function(child){
    hierarchymixinslib.Parent.prototype.addChild.call(this,child);
    this.changed.fire('newChild',child);
  };
  var _theater = new Theater();
  function loadSvg(svgpath,controllerctor,cb, progresscb, errorcb){
    loaderlib.loadSVG(svgpath,_theater.produceSvgController.bind(_theater,controllerctor, svgpath, cb), progresscb, errorcb);
  }
  function loadSvgPromised(svgpath,controllerctor){
    var d = lib.q.defer(), ret = d.promise;
    loaderlib.loadSVGPromised(svgpath).then(
      _theater.produceSvgController.bind(_theater,controllerctor,svgpath,d.resolve.bind(d)),
      d.reject.bind(d),
      d.notify.bind(d)
    );
    return ret;
  }
  mylib.load = loadSvg;
  mylib.loadPromised = loadSvgPromised;
  mylib.purgeTheater = function () {
    _theater.purge();
  };
  mylib.Theater = _theater;
}

module.exports = createTheater;

},{}]},{},[1]);
