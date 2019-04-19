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
