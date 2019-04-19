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
