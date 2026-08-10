import { View, Image, StyleSheet } from 'react-native';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProductCategoryScreen } from '../screens/ProductCategoryScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { StringingFormScreen } from '../screens/StringingFormScreen';
import { CricketBatsScreen } from '../screens/CricketBatsScreen';
import { CricketProductDetailScreen } from '../screens/CricketProductDetailScreen';
import { CricketCheckoutScreen } from '../screens/CricketCheckoutScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AuthWelcomeScreen } from '../screens/AuthWelcomeScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { GuestLoginScreen } from '../screens/GuestLoginScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileDetailsScreen } from '../screens/ProfileDetailsScreen';
import { PastOrdersScreen } from '../screens/PastOrdersScreen';
import { NotificationPreferencesScreen } from '../screens/NotificationPreferencesScreen';
import { SavedAddressesScreen } from '../screens/SavedAddressesScreen';
import { CloseButton } from '../components/CloseButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';
import type {
  HomeStackParamList,
  ProductsStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  ServicesStackParamList,
  TabParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function StackHeaderClose() {
  return <CloseButton style={{ marginRight: 4 }} />;
}

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

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.background },
  headerRight: () => <StackHeaderClose />,
  headerBackButtonDisplayMode: 'minimal' as const,
};

const sharedScreens = {
  Search: {
    component: SearchScreen,
    options: { headerShown: false as const, animation: 'fade_from_bottom' as const },
  },
  Notifications: {
    component: NotificationsScreen,
    options: { headerShown: false as const, animation: 'slide_from_right' as const },
  },
  ProductCategory: {
    component: ProductCategoryScreen,
    options: { title: 'Collection', headerBackTitle: 'Back' },
  },
  ServiceDetail: {
    component: ServiceDetailScreen,
    options: { title: 'Service Details', headerBackTitle: 'Back' },
  },
  StringingForm: {
    component: StringingFormScreen,
    options: { title: 'Badminton Stringing', headerBackTitle: 'Back' },
  },
  CricketBats: {
    component: CricketBatsScreen,
    options: { title: 'Cricket Bats', headerBackTitle: 'Back' },
  },
  CricketProductDetail: {
    component: CricketProductDetailScreen,
    options: { title: 'Bat Details', headerBackTitle: 'Back' },
  },
  CricketCheckout: {
    component: CricketCheckoutScreen,
    options: { title: 'Checkout', headerBackTitle: 'Back' },
  },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Search" component={sharedScreens.Search.component} options={sharedScreens.Search.options} />
      <HomeStack.Screen name="Notifications" component={sharedScreens.Notifications.component} options={sharedScreens.Notifications.options} />
      <HomeStack.Screen name="ProductCategory" component={sharedScreens.ProductCategory.component} options={sharedScreens.ProductCategory.options} />
      <HomeStack.Screen name="ServiceDetail" component={sharedScreens.ServiceDetail.component} options={sharedScreens.ServiceDetail.options} />
      <HomeStack.Screen name="StringingForm" component={sharedScreens.StringingForm.component} options={sharedScreens.StringingForm.options} />
      <HomeStack.Screen name="CricketBats" component={sharedScreens.CricketBats.component} options={sharedScreens.CricketBats.options} />
      <HomeStack.Screen name="CricketProductDetail" component={sharedScreens.CricketProductDetail.component} options={sharedScreens.CricketProductDetail.options} />
      <HomeStack.Screen name="CricketCheckout" component={sharedScreens.CricketCheckout.component} options={sharedScreens.CricketCheckout.options} />
    </HomeStack.Navigator>
  );
}

function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={stackScreenOptions}>
      <ProductsStack.Screen name="ProductsMain" component={ProductsScreen} options={{ headerShown: false }} />
      <ProductsStack.Screen name="Search" component={sharedScreens.Search.component} options={sharedScreens.Search.options} />
      <ProductsStack.Screen name="Notifications" component={sharedScreens.Notifications.component} options={sharedScreens.Notifications.options} />
      <ProductsStack.Screen name="ProductCategory" component={sharedScreens.ProductCategory.component} options={sharedScreens.ProductCategory.options} />
      <ProductsStack.Screen name="ServiceDetail" component={sharedScreens.ServiceDetail.component} options={sharedScreens.ServiceDetail.options} />
      <ProductsStack.Screen name="StringingForm" component={sharedScreens.StringingForm.component} options={sharedScreens.StringingForm.options} />
      <ProductsStack.Screen name="CricketBats" component={sharedScreens.CricketBats.component} options={sharedScreens.CricketBats.options} />
      <ProductsStack.Screen name="CricketProductDetail" component={sharedScreens.CricketProductDetail.component} options={sharedScreens.CricketProductDetail.options} />
      <ProductsStack.Screen name="CricketCheckout" component={sharedScreens.CricketCheckout.component} options={sharedScreens.CricketCheckout.options} />
    </ProductsStack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
    <ServicesStack.Navigator screenOptions={stackScreenOptions}>
      <ServicesStack.Screen name="ServicesMain" component={ServicesScreen} options={{ headerShown: false }} />
      <ServicesStack.Screen name="Search" component={sharedScreens.Search.component} options={sharedScreens.Search.options} />
      <ServicesStack.Screen name="Notifications" component={sharedScreens.Notifications.component} options={sharedScreens.Notifications.options} />
      <ServicesStack.Screen name="ProductCategory" component={sharedScreens.ProductCategory.component} options={sharedScreens.ProductCategory.options} />
      <ServicesStack.Screen name="ServiceDetail" component={sharedScreens.ServiceDetail.component} options={sharedScreens.ServiceDetail.options} />
      <ServicesStack.Screen name="StringingForm" component={sharedScreens.StringingForm.component} options={sharedScreens.StringingForm.options} />
      <ServicesStack.Screen name="CricketBats" component={sharedScreens.CricketBats.component} options={sharedScreens.CricketBats.options} />
      <ServicesStack.Screen name="CricketProductDetail" component={sharedScreens.CricketProductDetail.component} options={sharedScreens.CricketProductDetail.options} />
      <ServicesStack.Screen name="CricketCheckout" component={sharedScreens.CricketCheckout.component} options={sharedScreens.CricketCheckout.options} />
    </ServicesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStackNav.Navigator screenOptions={stackScreenOptions}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStackNav.Screen name="ProfileDetails" component={ProfileDetailsScreen} options={{ headerShown: false }} />
      <ProfileStackNav.Screen name="PastOrders" component={PastOrdersScreen} options={{ headerShown: false }} />
      <ProfileStackNav.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ headerShown: false }} />
      <ProfileStackNav.Screen name="SavedAddresses" component={SavedAddressesScreen} options={{ headerShown: false }} />
      <ProfileStackNav.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up', headerBackTitle: 'Back' }} />
      <ProfileStackNav.Screen name="Login" component={LoginScreen} options={{ title: 'Log in', headerBackTitle: 'Back' }} />
      <ProfileStackNav.Screen name="GuestLogin" component={GuestLoginScreen} options={{ title: 'Guest Login', headerBackTitle: 'Back' }} />
      <ProfileStackNav.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animation: 'fade_from_bottom' }} />
      <ProfileStackNav.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
    </ProfileStackNav.Navigator>
  );
}

function ProfileTabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
  const { user } = useAuth();

  if (user?.photoUri) {
    return (
      <View
        style={[
          styles.avatarWrap,
          {
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            borderColor: focused ? colors.primary : colors.borderLight,
          },
        ]}
      >
        <Image
          source={{ uri: user.photoUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
}

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
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Profile') {
            return <ProfileTabIcon color={color} size={size} focused={focused} />;
          }
          const icons: Record<
            Exclude<keyof TabParamList, 'Profile'>,
            keyof typeof Ionicons.glyphMap
          > = {
            Home: 'home',
            Products: 'grid',
            Services: 'construct',
            Contact: 'call',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Products" component={ProductsStackNavigator} options={{ title: 'Products' }} />
      <Tab.Screen name="Services" component={ServicesStackNavigator} options={{ title: 'Services' }} />
      <Tab.Screen name="Contact" component={ContactScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={stackScreenOptions}>
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="AuthWelcome"
          component={AuthWelcomeScreen}
          options={{ headerShown: false, presentation: 'modal', headerRight: undefined }}
        />
        <RootStack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: 'Sign Up', headerBackTitle: 'Back' }}
        />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Log in', headerBackTitle: 'Back' }}
        />
        <RootStack.Screen
          name="GuestLogin"
          component={GuestLoginScreen}
          options={{ title: 'Guest Login', headerBackTitle: 'Back' }}
        />
        <RootStack.Screen
          name="BookingSuccess"
          component={BookingSuccessScreen}
          options={{ headerShown: false, gestureEnabled: false, headerRight: undefined }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
});
