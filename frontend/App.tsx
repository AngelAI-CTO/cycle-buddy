import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddPartnerScreen from "./src/screens/AddPartnerScreen";
import PartnerDetailScreen from "./src/screens/PartnerDetailScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const COLORS = {
  bg: "#0a0e17",
  surface: "#111827",
  border: "#1e2d3d",
  cyan: "#00d4ff",
  textPrimary: "#e2e8f0",
  textMuted: "#475569",
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.cyan,
  headerTitleStyle: {
    fontWeight: "bold" as const,
    fontFamily: "monospace",
    letterSpacing: 2,
    fontSize: 14,
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.cyan,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: "monospace",
          letterSpacing: 1,
          fontSize: 10,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "DASHBOARD", tabBarLabel: "MONITOR" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: "СИСТЕМА", tabBarLabel: "SYSTEM" }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.cyan} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddPartner"
            component={AddPartnerScreen}
            options={{ title: "NEW TARGET" }}
          />
          <Stack.Screen
            name="PartnerDetail"
            component={PartnerDetailScreen}
            options={{ title: "STATUS" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
