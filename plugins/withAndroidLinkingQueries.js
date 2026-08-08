const { withAndroidManifest } = require('expo/config-plugins');

const WHATSAPP_PACKAGES = ['com.whatsapp', 'com.whatsapp.w4b'];

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

function hasPackage(queries, packageName) {
  return (queries.package ?? []).some((pkg) => pkg.$?.['android:name'] === packageName);
}

function withAndroidLinkingQueries(config) {
  return withAndroidManifest(config, (config) => {
    const queries = ensureQueries(config.modResults.manifest);

    if (!queries.intent) {
      queries.intent = [];
    }
    if (!queries.package) {
      queries.package = [];
    }

    for (const scheme of ['whatsapp', 'tel', 'mailto']) {
      if (!hasIntent(queries, scheme)) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    }

    for (const packageName of WHATSAPP_PACKAGES) {
      if (!hasPackage(queries, packageName)) {
        queries.package.push({ $: { 'android:name': packageName } });
      }
    }

    return config;
  });
}

module.exports = withAndroidLinkingQueries;
