import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { ProductCategoryScreen } from '../screens/ProductCategoryScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { StringingFormScreen } from '../screens/StringingFormScreen';
import { CricketBatsScreen } from '../screens/CricketBatsScreen';
import { CricketProductDetailScreen } from '../screens/CricketProductDetailScreen';
import { CricketCheckoutScreen } from '../screens/CricketCheckoutScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';
import { colors } from '../constants/theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          height: 88,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Products: 'grid',
            Services: 'construct',
            Contact: 'call',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ProductCategory"
          component={ProductCategoryScreen}
          options={{
            title: 'Collection',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="ServiceDetail"
          component={ServiceDetailScreen}
          options={{
            title: 'Service Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="StringingForm"
          component={StringingFormScreen}
          options={{
            title: 'Badminton Stringing',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="CricketBats"
          component={CricketBatsScreen}
          options={{ title: 'Cricket Bats', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="CricketProductDetail"
          component={CricketProductDetailScreen}
          options={{ title: 'Bat Details', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="CricketCheckout"
          component={CricketCheckoutScreen}
          options={{ title: 'Checkout', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false, animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="BookingSuccess"
          component={BookingSuccessScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
