import '../config/env';

import { relative } from 'path';
import { yellow, underline, cyan, green, red } from 'react-dev-utils/chalk';
import { existsSync, emptyDirSync, copySync } from 'fs-extra';
import webpack from 'webpack';
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import printHostingInstructions from 'react-dev-utils/printHostingInstructions';
import FileSizeReporter from 'react-dev-utils/FileSizeReporter';
import printBuildError from 'react-dev-utils/printBuildError';

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
import { checkBrowsers } from 'react-dev-utils/browsersHelper';
import paths, {
  yarnLockFile,
  appHtml,
  appIndexJs,
  appPath,
  appBuild,
  appPackageJson,
  appPublic,
} from '../config/paths';
import configFactory from '../config/webpack.config';

// Do this as the first thing so that any code reading it knows the right env.
// Ensure environment variables are read.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const { measureFileSizesBeforeBuild } = FileSizeReporter;
const { printFileSizesAfterBuild } = FileSizeReporter;
const useYarn = existsSync(yarnLockFile);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

const copyPublicFolder = () => {
  copySync(appPublic, appBuild, {
    dereference: true,
    filter: file => file !== appHtml,
  });
};

// Warn and crash if required files are missing
if (!checkRequiredFiles([appHtml, appIndexJs])) {
  process.exit(1);
}

// Generate configuration
const config = configFactory('production');

checkBrowsers(appPath, isInteractive)
  .then(() => {
    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    return measureFileSizesBeforeBuild(appBuild);
  })
  .then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    emptyDirSync(appBuild);
    // Merge with the public folder
    copyPublicFolder();
    // Start the webpack build
    return build(previousFileSizes);
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(`\nSearch for the ${underline(yellow('keywords'))} to learn more about each warning.`);
        console.log(`To ignore, add ${cyan('// eslint-disable-next-line')} to the line before.\n`);
      } else {
        console.log(green('Compiled successfully.\n'));
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE,
      );
      console.log();

      const appPackage = require(appPackageJson);
      const { publicUrl } = paths;
      const { publicPath } = config.output;
      const buildFolder = relative(process.cwd(), appBuild);
      printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder, useYarn);
    },
    err => {
      console.log(red('Failed to compile.\n'));
      printBuildError(err);
      process.exit(1);
    },
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  // We used to support resolving modules according to `NODE_PATH`.
  // This now has been deprecated in favor of jsconfig/tsconfig.json
  // This lets you use absolute paths in imports inside large monorepos:
  if (process.env.NODE_PATH) {
    console.log(
      yellow(
        'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.',
      ),
    );
    console.log();
  }

  console.log('Creating an optimized production build...');

  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }
        messages = formatWebpackMessages({
          errors: [err.message],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(stats.toJson({ all: false, warnings: true, errors: true }));
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n',
          ),
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      });
    });
  });
}
