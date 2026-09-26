import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.icon}>🍽️</Text>

        <Text style={styles.title}>Our Restaurant</Text>

        <Text style={styles.subtitle}>Delicious food, made fresh for you</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>About Us</Text>

        <Text style={styles.description}>
          Welcome to our Restaurant App. We serve fresh, delicious and quality
          food for our customers. Enjoy your favorite meals with dine-in,
          takeaway and home delivery services.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>📍 Location</Text>

        <Text style={styles.infoText}>F-6 Markaz, Islamabad, Pakistan</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>📞 Contact</Text>

        <Text style={styles.infoText}>0333 5736534</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>🕐 Opening Hours</Text>

        <Text style={styles.infoText}>11:00 AM - 11:00 PM</Text>

        <Text style={styles.openText}>Open Daily</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>🚴 Our Services</Text>

        <View style={styles.serviceRow}>
          <Text style={styles.serviceIcon}>🍴</Text>
          <Text style={styles.serviceText}>Dine-in</Text>
        </View>

        <View style={styles.serviceRow}>
          <Text style={styles.serviceIcon}>🥡</Text>
          <Text style={styles.serviceText}>Takeaway</Text>
        </View>

        <View style={styles.serviceRow}>
          <Text style={styles.serviceIcon}>🚴</Text>
          <Text style={styles.serviceText}>Home Delivery</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("/menu")}
      >
        <Text style={styles.menuButtonText}>🍽️ View Full Menu →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>❤️ Thank you for choosing us!</Text>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    backgroundColor: "#E85D04",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  icon: {
    fontSize: 50,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 8,
  },

  subtitle: {
    color: "#FFE8D6",
    fontSize: 14,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 15,
    padding: 18,
    borderRadius: 15,
  },

  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },

  description: {
    color: "#666",
    fontSize: 13,
    lineHeight: 20,
  },

  infoText: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },

  openText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 6,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  serviceIcon: {
    fontSize: 21,
    width: 35,
  },

  serviceText: {
    color: "#555",
    fontSize: 14,
  },

  menuButton: {
    backgroundColor: "#E85D04",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  backButton: {
    alignItems: "center",
    marginTop: 14,
  },

  backText: {
    color: "#E85D04",
    fontSize: 14,
    fontWeight: "bold",
  },

  bottomText: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    marginTop: 22,
  },

  bottomSpace: {
    height: 25,
  },
});
