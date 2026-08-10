#!/usr/bin/env node
/**
 * Fast local release APK builder.
 *
 * Default: reuse existing android/ (no wipe), build arm64-v8a only.
 *   npm run build:apk
 *
 * Full regenerate + arm64:
 *   npm run build:apk:clean
 *
 * All ABIs (slower, wider device coverage):
 *   npm run build:apk -- --all-arch
 */
const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');
const clean = process.argv.includes('--clean');
const allArch = process.argv.includes('--all-arch');

function resolveJavaHome() {
  if (process.env.JAVA_HOME && existsSync(path.join(process.env.JAVA_HOME, 'bin', 'java'))) {
    return process.env.JAVA_HOME;
  }
  const candidates = [
    '/usr/local/opt/openjdk@17',
    '/opt/homebrew/opt/openjdk@17',
    '/usr/local/opt/openjdk',
    '/opt/homebrew/opt/openjdk',
    '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
  ];
  return candidates.find((dir) => existsSync(path.join(dir, 'bin', 'java')));
}

function run(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    cwd: opts.cwd ?? root,
    stdio: 'inherit',
    env: opts.env ?? process.env,
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const javaHome = resolveJavaHome();
if (!javaHome) {
  console.error('No JDK found. Install OpenJDK 17 or set JAVA_HOME.');
  process.exit(1);
}

const androidHome =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(os.homedir(), 'Library', 'Android', 'sdk');

if (!existsSync(androidHome)) {
  console.error(`Android SDK not found at ${androidHome}. Set ANDROID_HOME.`);
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${path.join(androidHome, 'platform-tools')}${path.delimiter}${process.env.PATH}`,
};

const needPrebuild = clean || !existsSync(androidDir);
if (needPrebuild) {
  console.log(clean ? 'Clean prebuild (regenerating android/)…' : 'android/ missing — running prebuild…');
  const prebuildArgs = ['expo', 'prebuild', '--platform', 'android', '--no-install'];
  if (clean && existsSync(androidDir)) {
    // default prebuild clears; no --no-clean
  } else if (!clean && existsSync(androidDir)) {
    prebuildArgs.push('--no-clean');
  }
  run('npx', prebuildArgs, { env });
} else {
  console.log('Reusing existing android/ (incremental). Use --clean to regenerate.');
  // Sync config plugins without wiping caches
  run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install', '--no-clean'], { env });
}

const gradleArgs = ['assembleRelease'];
if (!allArch) {
  gradleArgs.push('-PreactNativeArchitectures=arm64-v8a');
  console.log('Building arm64-v8a only (use --all-arch for every ABI).');
} else {
  console.log('Building all ABIs…');
}

run('./gradlew', gradleArgs, { cwd: androidDir, env });

const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
console.log(`\nAPK ready: ${apk}`);
