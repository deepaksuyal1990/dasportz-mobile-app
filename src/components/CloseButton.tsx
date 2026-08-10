import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { colors } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

type CloseNav = {
  canGoBack: () => boolean;
  goBack: () => void;
  dispatch: (action: ReturnType<typeof CommonActions.navigate>) => void;
};

/** Dismiss current screen — go back, or return home if nothing to pop. */
export function closeCurrentScreen(navigation: CloseNav) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigation.dispatch(
    CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: 'Home' },
    }),
  );
}

export function CloseButton({ onPress, color = colors.text, size = 24, style }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => closeCurrentScreen(navigation))}
      hitSlop={14}
      accessibilityRole="button"
      accessibilityLabel="Close"
      style={[styles.btn, style]}
    >
      <Ionicons name="close" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
