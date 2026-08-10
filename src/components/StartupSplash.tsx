import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../constants/theme';
import { business } from '../data/content';

const DURATION_MS = 4000;
const LOGO_SIZE = 148;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Short line under the progress bar — professional, sport-retail tone. */
const LOADING_LINE = 'Preparing your sports essentials';

type Props = {
  onFinish: () => void;
};

/**
 * Brand intro: store backdrop → logo bloom + shine → wordmark → hold → fade out (~5s).
 */
export function StartupSplash({ onFinish }: Props) {
  const backdropOpacity = useRef(new Animated.Value(1)).current;
  const bgScale = useRef(new Animated.Value(1.08)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(18)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const shineX = useRef(new Animated.Value(-120)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      onFinish();
    };

    const bgEnter = Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bgScale, {
        toValue: 1,
        duration: DURATION_MS - 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslate, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 560,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 520,
          delay: 280,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const shine = Animated.timing(shineX, {
      toValue: SCREEN_W,
      duration: 900,
      delay: 700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });

    const progress = Animated.timing(barWidth, {
      toValue: 1,
      duration: DURATION_MS - 420,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    const exit = Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 420,
      delay: DURATION_MS - 420,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });

    bgEnter.start();
    entrance.start();
    shine.start();
    progress.start();
    exit.start(({ finished: ok }) => {
      if (ok) done();
    });

    const fallback = setTimeout(done, DURATION_MS + 80);
    return () => clearTimeout(fallback);
  }, [
    backdropOpacity,
    barWidth,
    bgOpacity,
    bgScale,
    logoOpacity,
    logoScale,
    onFinish,
    shineX,
    statusOpacity,
    tagOpacity,
    wordOpacity,
    wordTranslate,
  ]);

  const progressWidth = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: backdropOpacity }]} pointerEvents="auto">
      <View style={styles.bgBase} />

      <Animated.View
        style={[
          styles.bgImageWrap,
          {
            opacity: bgOpacity,
            transform: [{ scale: bgScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/splash-background.jpg')}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Dark scrim so logo + copy stay readable over the store photo */}
      <LinearGradient
        colors={[
          'rgba(2,8,20,0.72)',
          'rgba(6,13,24,0.55)',
          'rgba(6,13,24,0.78)',
          'rgba(2,8,20,0.92)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              {
                transform: [{ translateX: shineX }, { rotate: '18deg' }],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shineGradient}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordTranslate }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brand}>{business.name}</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
            PLAY MORE. WIN MORE.
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: progressWidth }]} />
        </View>
        <Animated.Text style={[styles.statusLine, { opacity: statusOpacity }]}>
          {LOADING_LINE}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#020814',
  },
  bgImageWrap: {
    ...StyleSheet.absoluteFill,
  },
  bgImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  shine: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 56,
  },
  shineGradient: {
    flex: 1,
  },
  brand: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 56,
    left: 48,
    right: 48,
    alignItems: 'center',
    gap: spacing.md,
  },
  barTrack: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  statusLine: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
