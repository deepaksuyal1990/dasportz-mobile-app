import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';

type IconConfig =
  | { set: 'material'; name: keyof typeof MaterialCommunityIcons.glyphMap }
  | { set: 'ionicons'; name: keyof typeof Ionicons.glyphMap };

type Props = {
  label: string;
  sublabel: string;
  icon: IconConfig;
  image: ImageSourcePropType;
  gradient: [string, string];
  onPress: () => void;
  width: number;
};

function ActionIcon({ icon, color, size }: { icon: IconConfig; color: string; size: number }) {
  if (icon.set === 'material') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}

export function QuickActionCard({ label, sublabel, icon, image, gradient, onPress, width }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(6,13,24,0.55)', 'rgba(6,13,24,0.92)']}
          style={styles.overlay}
        />
        <LinearGradient
          colors={[`${gradient[0]}99`, `${gradient[1]}44`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tint}
        />

        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: gradient[1] }]}>
            <ActionIcon icon={icon} color={colors.white} size={20} />
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sublabel}>{sublabel}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 128,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 128,
  },
  imageStyle: {
    borderRadius: radius.lg,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  tint: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  content: {
    padding: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '800',
    marginBottom: 2,
  },
  sublabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
});
