function createLib (execlib, hierarchymixinslib, commonlib, renderinglib, loaderlib) {
  'use strict';

  var lib = execlib.lib;
  var ret = {};

  require('./src/RenderingParentcreator')(lib, hierarchymixinslib, renderinglib, ret);
  require('./src/Theatercreator')(lib, hierarchymixinslib, commonlib, renderinglib, loaderlib, ret);

  return ret;
}

module.exports = createLib;
