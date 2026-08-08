import type { RootStackParamList } from '../navigation/types';

export function navigateToCategory(
  navigation: { navigate: (screen: keyof RootStackParamList, params?: object) => void },
  categoryId: string,
) {
  if (categoryId === 'cricket-bats-gear') {
    navigation.navigate('CricketBats');
    return;
  }
  navigation.navigate('ProductCategory', { categoryId });
}
