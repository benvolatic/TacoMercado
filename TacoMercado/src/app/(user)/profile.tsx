import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { supabase } from "src/lib/supabase";

const ProfileScreen = () => {
  return (
    <View>
      <Pressable
        style={styles.button}
        onPress={async () => await supabase.auth.signOut()}
      >
        <Text style={styles.text}>Sign Out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});

export default ProfileScreen;
