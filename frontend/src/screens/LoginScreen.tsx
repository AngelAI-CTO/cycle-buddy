import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../theme";

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("ОШИБКА", "Заполни все поля, солдат");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    } catch (e: any) {
      Alert.alert("ОШИБКА", e.message || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBlock}>
        <Text style={styles.logoPrefix}>[ </Text>
        <Text style={styles.logo}>CYCLE BUDDY</Text>
        <Text style={styles.logoPrefix}> ]</Text>
      </View>
      <Text style={styles.subtitle}>TACTICAL RELATIONSHIP SYSTEM</Text>
      <View style={styles.divider} />

      <Text style={styles.label}>ПОЗЫВНОЙ</Text>
      <TextInput
        style={styles.input}
        placeholder="agent_name"
        placeholderTextColor={COLORS.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>ПАРОЛЬ</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={COLORS.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.bg} />
        ) : (
          <Text style={styles.buttonText}>
            {isRegister ? "[ СОЗДАТЬ АККАУНТ ]" : "[ ВОЙТИ В СИСТЕМУ ]"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.switchText}>
          {isRegister
            ? "Уже есть аккаунт? > ВОЙТИ"
            : "Новый агент? > РЕГИСТРАЦИЯ"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    padding: 24,
  },
  logoBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoPrefix: {
    fontSize: 28,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    letterSpacing: 6,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 32,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 4,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: COLORS.cyan,
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.bg,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  switchText: {
    color: COLORS.cyanDim,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "monospace",
  },
});
