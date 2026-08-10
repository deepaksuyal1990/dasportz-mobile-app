import { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';

type Props = {
  uri?: string;
  size?: number;
  onPress?: () => void;
  editable?: boolean;
};

export function ProfileAvatar({ uri, size = 88, onPress, editable }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const showImage = !!uri && !failed;

  const content = (
    <View
      style={[
        styles.clip,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailed(true)}
          onLoad={() => setFailed(false)}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Ionicons name="person" size={size * 0.42} color={colors.textMuted} />
        </View>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ width: size, height: size }}>
      {content}
      {editable ? (
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
});
