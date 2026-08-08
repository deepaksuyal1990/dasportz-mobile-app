import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  Products: undefined;
  Services: undefined;
  Contact: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  ProductCategory: { categoryId: string };
  ServiceDetail: { serviceId: string };
  StringingForm: undefined;
  CricketBats: undefined;
  CricketProductDetail: { productId: string };
  CricketCheckout: { productId: string };
  Search: { query?: string } | undefined;
  BookingSuccess: {
    kind: 'service' | 'purchase';
    amount: string;
    orderId: string;
    customerName: string;
    paymentMethod: 'cash' | 'upi';
    details?: Array<{ label: string; value: string }>;
  };
};

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
