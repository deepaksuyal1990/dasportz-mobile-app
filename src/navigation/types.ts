import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type BookingSuccessParams = {
  kind: 'service' | 'purchase';
  amount: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'upi';
  details?: Array<{ label: string; value: string }>;
};

/** Shared screens reachable from Home / Products / Services while keeping the tab bar. */
export type SharedStackParamList = {
  Search: { query?: string } | undefined;
  Notifications: undefined;
  ProductCategory: { categoryId: string };
  ServiceDetail: { serviceId: string };
  StringingForm: undefined;
  CricketBats: undefined;
  CricketProductDetail: { productId: string };
  CricketCheckout: { productId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
} & SharedStackParamList;

export type ProductsStackParamList = {
  ProductsMain: undefined;
} & SharedStackParamList;

export type ServicesStackParamList = {
  ServicesMain: undefined;
} & SharedStackParamList;

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileDetails: undefined;
  PastOrders: undefined;
  NotificationPreferences: undefined;
  SavedAddresses: undefined;
  SignUp: undefined;
  Login: undefined;
  GuestLogin: undefined;
  Search: { query?: string } | undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Products: NavigatorScreenParams<ProductsStackParamList> | undefined;
  Services: NavigatorScreenParams<ServicesStackParamList> | undefined;
  Contact: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/** Root stack — auth modals + post-checkout (full-screen, no tab bar). */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  AuthWelcome: undefined;
  SignUp: undefined;
  GuestLogin: undefined;
  Login: undefined;
  BookingSuccess: BookingSuccessParams;
  // Legacy aliases kept so existing navigate() calls still type-check via RootStack
  Search: { query?: string } | undefined;
  Notifications: undefined;
  ProductCategory: { categoryId: string };
  ServiceDetail: { serviceId: string };
  StringingForm: undefined;
  CricketBats: undefined;
  CricketProductDetail: { productId: string };
  CricketCheckout: { productId: string };
  ProfileDetails: undefined;
  PastOrders: undefined;
  NotificationPreferences: undefined;
  SavedAddresses: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  TabScreenProps<'Home'>
>;

export type ProductsStackScreenProps<T extends keyof ProductsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, T>,
  TabScreenProps<'Products'>
>;

export type ServicesStackScreenProps<T extends keyof ServicesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ServicesStackParamList, T>,
  TabScreenProps<'Services'>
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  TabScreenProps<'Profile'>
>;
