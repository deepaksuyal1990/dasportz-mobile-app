import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationProvider } from './src/context/NotificationContext';
import { AuthProvider } from './src/context/AuthContext';
import { StartupSplash } from './src/components/StartupSplash';
import { OrderStatusNotifier } from './src/components/OrderStatusNotifier';
import { ensureNotificationPermissions } from './src/services/localNotifications';
// Zoho native SDK disabled for localhost / web dev.
// import { initZohoPayments } from './src/services/zohoPayments';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // initZohoPayments();
    void ensureNotificationPermissions();
  }, []);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <OrderStatusNotifier />
          <AppNavigator />
          <StatusBar style="light" />
          {showSplash ? <StartupSplash onFinish={finishSplash} /> : null}
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
