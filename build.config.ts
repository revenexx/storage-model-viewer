import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: 'node16',
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: false,
  },
  // Heavy 3D deps stay external — the consumer bundles/dedupes them, and the
  // engine code is dynamically imported so only the chosen engine is fetched.
  externals: ['three', '@google/model-viewer'],
})
