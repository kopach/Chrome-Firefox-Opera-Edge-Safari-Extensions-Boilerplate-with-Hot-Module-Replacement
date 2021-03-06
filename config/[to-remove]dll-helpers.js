const helpers = require('./helpers');
const defaults = require('./defaults');
const fs = require('fs');
const webpack = require('webpack');

const { root, pathJoin } = helpers;

function installVendorDLL(config, dllName) {
  const manifest = loadDLLManifest(root(`config/webpack/dlls/${dllName}.json`));

  if (manifest) {
    console.log(`Webpack: will be using the ${dllName} DLL.`);

    config.plugins.push(new webpack.DllReferencePlugin({
      context: defaults.ROOT_DIR,
      manifest
    }));
  }
}

function loadDLLManifest(filePath) {
  try {
    return require(filePath);
  } catch (e) {
    process.env.WEBPACK_DLLS = '0';

    console.error(`========================================================================
    Environment Error
    ------------------------------------------------------------------------
    You have requested to use webpack DLLs (env var WEBPACK_DLLS=1) but a
    manifest could not be found. This likely means you have forgotten to
    build the DLLs.
    You can do that by running:
        npm run build:dlls
    The request to use DLLs for this build will be ignored.`);
  }

  return undefined;
}

function isValidDLLs(dllNames, assetsPath) {
  for (const dllName of dllNames) {
    try {
      const manifest = require(root(`config/webpack/dlls/${dllName}.json`));
      const dll = fs.readFileSync(pathJoin('config/webpack', `dlls/dll__${dllName}.js`)).toString('utf-8');
      if (dll.indexOf(manifest.name) === -1) {
        console.warn(`Invalid dll: ${dllName}`);
        return false;
      }
    } catch (e) {
      console.warn(e.message);
      return false;
    }
  }
  return true;
}

module.exports = {
  installVendorDLL,
  isValidDLLs
};
