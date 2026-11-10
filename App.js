import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import { TradingProvider } from './src/context/TradingContext';
import { colors } from './src/theme';
import DashboardScreen from './src/screens/DashboardScreen';
import StocksScreen from './src/screens/StocksScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import TradingScreen from './src/screens/TradingScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WatchScreen from './src/screens/WatchScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.blue,
  },
};

const icons = {
  Panel: 'stats-chart',
  Empresas: 'list',
  Trading: 'swap-horizontal',
  Alertas: 'notifications',
  Ajustes: 'settings',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Panel" component={DashboardScreen} options={{ title: 'InvestAlert' }} />
      <Tab.Screen name="Empresas" component={StocksScreen} />
      <Tab.Screen name="Trading" component={TradingScreen} />
      <Tab.Screen name="Alertas" component={AlertsScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <TradingProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: colors.bg },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
              <Stack.Screen
                name="StockDetail"
                component={StockDetailScreen}
                options={({ route }) => ({ title: route.params.symbol })}
              />
              <Stack.Screen name="Watch" component={WatchScreen} options={{ title: 'Modo reloj' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </TradingProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}