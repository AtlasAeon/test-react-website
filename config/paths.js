import { resolve } from 'path';
import { realpathSync, existsSync } from 'fs';
import { parse } from 'url';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = realpathSync(process.cwd());
const resolveApp = relativePath => resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  }
  if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  }
  return inputPath;
}

const getPublicUrl = appPackageJson => envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const getServedPath = appPackageJson => {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl = envPublicUrl || (publicUrl ? parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
};

export const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(_extension => existsSync(resolveFn(`${filePath}.${_extension}`)));

  if (extension) return resolveFn(`${filePath}.${extension}`);

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
export const dotenv = resolveApp('.env');
export const appPath = resolveApp('.');
export const appBuild = resolveApp('build');
export const appPublic = resolveApp('public');
export const appHtml = resolveApp('public/index.html');
export const appIndexJs = resolveModule(resolveApp, 'src/index');
export const appPackageJson = resolveApp('package.json');
export const appSrc = resolveApp('src');
export const appTsConfig = resolveApp('tsconfig.json');
export const appJsConfig = resolveApp('jsconfig.json');
export const yarnLockFile = resolveApp('yarn.lock');
export const testsSetup = resolveModule(resolveApp, 'src/setupTests');
export const proxySetup = resolveApp('src/setupProxy.js');
export const appNodeModules = resolveApp('node_modules');
export const publicUrl = getPublicUrl(resolveApp('package.json'));
export const servedPath = getServedPath(resolveApp('package.json'));
