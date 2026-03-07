import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../theme";

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("ВЫХОД", "Покинуть систему?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>СИСТЕМА</Text>
      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О ПРОГРАММЕ</Text>
        <View style={styles.sectionLine} />
        <Text style={styles.text}>
          CYCLE BUDDY — тактическая система мониторинга женских циклов.{"\n\n"}
          Помогает мужчинам выживать, понимать и быть лучшими партнёрами.
        </Text>
        <Text style={styles.version}>v1.0.0 // BUILD 001</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>[ ВЫЙТИ ИЗ СИСТЕМЫ ]</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 4,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 12,
    marginBottom: 24,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 3,
  },
  sectionLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 8,
    marginBottom: 12,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "monospace",
  },
  version: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 16,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  logoutText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
});
