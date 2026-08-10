import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../constants/theme';

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  image?: ImageSourcePropType;
  onPress: () => void;
};

export function CategoryCard({ title, description, icon, gradient, image, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.wrapper}>
      {image ? (
        <ImageBackground
          source={image}
          style={styles.card}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(6,13,24,0.35)', 'rgba(6,13,24,0.88)']}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[`${gradient[0]}66`, `${gradient[1]}33`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={28} color={colors.white} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
            <View style={styles.ctaRow}>
              <Text style={styles.cta}>Browse Collection</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={28} color={colors.white} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
            <View style={styles.ctaRow}>
              <Text style={styles.cta}>Browse Collection</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </View>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    minHeight: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageStyle: {
    borderRadius: radius.lg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  cta: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
});
