import type { ReactNode } from 'react';
import { ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { AppFooter } from './AppFooter';
import { colors } from '../constants/theme';

type Props = ScrollViewProps & {
  children: ReactNode;
  /** Hide store/call/email quick links (e.g. Contact page already has them). */
  showFooterLinks?: boolean;
};

/** ScrollView that always ends with the shared brand footer. */
export function ScreenScroll({
  children,
  showFooterLinks = true,
  contentContainerStyle,
  ...rest
}: Props) {
  return (
    <ScrollView
      {...rest}
      style={[styles.scroll, rest.style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={rest.showsVerticalScrollIndicator ?? false}
    >
      {children}
      <AppFooter showLinks={showFooterLinks} />
    </ScrollView>
  );
}

/** Use as FlatList ListFooterComponent. */
export function ListAppFooter({ showLinks = true }: { showLinks?: boolean }) {
  return (
    <View style={styles.listFooter}>
      <AppFooter showLinks={showLinks} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  listFooter: {
    paddingTop: 8,
  },
});
