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
