import { useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export function PressableCard({ children, onPress, style, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: toValue === 1 ? 6 : 0,
    }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      onPressIn={() => onPress && animate(0.97)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
