const { withGradleProperties } = require('expo/config-plugins');

/**
 * Speeds up local Android builds: more Gradle memory, build cache, parallel work.
 */
function withFasterAndroidBuilds(config) {
  return withGradleProperties(config, (gradleConfig) => {
    const props = gradleConfig.modResults;

    const set = (key, value) => {
      const index = props.findIndex((item) => item.type === 'property' && item.key === key);
      if (index >= 0) {
        props[index].value = value;
      } else {
        props.push({ type: 'property', key, value });
      }
    };

    set(
      'org.gradle.jvmargs',
      '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
    );
    set('org.gradle.caching', 'true');
    set('org.gradle.parallel', 'true');
    set('org.gradle.daemon', 'true');
    set('org.gradle.configureondemand', 'true');

    return gradleConfig;
  });
}

module.exports = withFasterAndroidBuilds;
