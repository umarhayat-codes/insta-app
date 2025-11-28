import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { ProfileProvider } from "./context/ProfileProvider";

const StackLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (session && inAuthGroup) {
      router.replace("/home/main");
    } else if (!session && !inAuthGroup) {
      router.replace("/auth/login");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="home/main" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <StackLayout />
      </ProfileProvider>
    </AuthProvider>
  );
}
