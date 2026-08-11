import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import type { BookingSuccessParams } from '../navigation/types';

type TabName = 'Home' | 'Products' | 'Services' | 'Contact' | 'Profile';

const TAB_ROOT: Record<Exclude<TabName, 'Contact'>, string> = {
  Home: 'HomeMain',
  Products: 'ProductsMain',
  Services: 'ServicesMain',
  Profile: 'ProfileMain',
};

/** Open BookingSuccess on the root stack (above tabs). */
export function navigateToBookingSuccess(
  navigation: NavigationProp<ParamListBase>,
  params: BookingSuccessParams,
) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'BookingSuccess',
      params,
    }),
  );
}

/** Open order tracking on the root stack (above tabs). */
export function navigateToOrderTracking(
  navigation: NavigationProp<ParamListBase>,
  orderId: string,
) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'OrderTracking',
      params: { orderId },
    }),
  );
}

/** Jump to a bottom tab from any nested screen. */
export function navigateToTab(navigation: NavigationProp<ParamListBase>, tab: TabName) {
  if (tab === 'Contact') {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Contact' },
      }),
    );
    return;
  }

  navigation.dispatch(
    CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: tab, params: { screen: TAB_ROOT[tab] } },
    }),
  );
}

/** After auth, land on Profile (works from root or nested Profile stack). */
export function navigateAfterAuth(navigation: NavigationProp<ParamListBase>) {
  navigateToTab(navigation, 'Profile');
}
