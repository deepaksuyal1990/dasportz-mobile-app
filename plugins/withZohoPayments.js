const {
  withProjectBuildGradle,
  withAndroidManifest,
  withAppBuildGradle,
} = require('expo/config-plugins');

const UPI_SCHEMES = ['upi', 'tez', 'phonepe', 'paytmmp', 'bhim', 'gpay'];

function ensureQueries(manifest) {
  if (!manifest.queries) {
    manifest.queries = [{}];
  }
  if (!Array.isArray(manifest.queries)) {
    manifest.queries = [manifest.queries];
  }
  if (manifest.queries.length === 0) {
    manifest.queries.push({});
  }
  return manifest.queries[0];
}

function hasIntent(queries, scheme) {
  return (queries.intent ?? []).some((intent) =>
    (intent.data ?? []).some((data) => data.$?.['android:scheme'] === scheme),
  );
}

function withZohoPayments(config) {
  config = withProjectBuildGradle(config, (gradleConfig) => {
    if (!gradleConfig.modResults.contents.includes('maven.zohodl.com')) {
      gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
        /mavenCentral\(\)\n(\s*)maven \{ url 'https:\/\/www\.jitpack\.io' \}/,
        "mavenCentral()\n$1maven { url 'https://www.jitpack.io' }\n$1maven { url 'https://maven.zohodl.com' }",
      );
    }
    return gradleConfig;
  });

  config = withAndroidManifest(config, (manifestConfig) => {
    const queries = ensureQueries(manifestConfig.modResults.manifest);
    if (!queries.intent) {
      queries.intent = [];
    }

    for (const scheme of UPI_SCHEMES) {
      if (!hasIntent(queries, scheme)) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    }

    return manifestConfig;
  });

  config = withAppBuildGradle(config, (gradleConfig) => {
    if (!gradleConfig.modResults.contents.includes('Math.max(rootProject.ext.minSdkVersion')) {
      gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
        /minSdkVersion rootProject\.ext\.minSdkVersion/,
        'minSdkVersion Math.max(rootProject.ext.minSdkVersion, 26)',
      );
    }
    return gradleConfig;
  });

  return config;
}

module.exports = withZohoPayments;
