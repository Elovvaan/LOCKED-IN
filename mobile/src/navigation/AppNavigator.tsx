import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

import { AuthScreen } from '../screens/AuthScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { CreateSkillScreen } from '../screens/CreateSkillScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SkillDetailScreen } from '../screens/SkillDetailScreen';
import { BattleModeScreen } from '../screens/BattleModeScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0e0e0e',
    card: '#0e0e0e',
    border: '#0e0e0e',
    text: '#ffffff',
    primary: '#8eff71',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopWidth: 0,
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#58ff37',
        tabBarInactiveTintColor: '#777777',
        tabBarLabelStyle: {
          fontSize: 11,
          letterSpacing: 0.7,
          fontWeight: '800',
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Explore: 'compass',
            Create: 'add-circle',
            Arena: 'trophy',
            Profile: 'person',
          };
          return <Ionicons name={iconMap[route.name]} size={focused ? size + 2 : size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} />
      <Tab.Screen name="Explore" component={BattleModeScreen} initialParams={{ id: 1 }} />
      <Tab.Screen name="Create" component={CreateSkillScreen} />
      <Tab.Screen name="Arena" component={EventDetailScreen} initialParams={{ id: 1 }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
            <Stack.Screen name="BattleMode" component={BattleModeScreen} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
