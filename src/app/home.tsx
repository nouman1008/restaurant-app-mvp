import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

const featuredFoods = [
  {
    name: "Zinger Burger",
    price: 450,
    emoji: "🍔",
    category: "Burger",
  },
  {
    name: "Chicken Pizza",
    price: 900,
    emoji: "🍕",
    category: "Pizza",
  },
  {
    name: "Chicken Biryani",
    price: 350,
    emoji: "🍛",
    category: "Pakistani",
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Welcome to</Text>

            <Text style={styles.restaurantName}>🍽️ Restaurant App</Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/cart")}
            >
              <Text style={styles.cartIcon}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.tagline}>Delicious food, made fresh for you</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/menu")}
        >
          <Text style={styles.menuButtonText}>Explore Full Menu →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reservationButton}
          onPress={() => router.push("/reservation")}
        >
          <Text style={styles.reservationButtonText}>📅 Reserve a Table</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🍴</Text>

          <Text style={styles.infoTitle}>Fresh Food</Text>

          <Text style={styles.infoText}>Made fresh daily</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🚴</Text>

          <Text style={styles.infoTitle}>Delivery</Text>

          <Text style={styles.infoText}>Fast & easy</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⭐</Text>

          <Text style={styles.infoTitle}>Quality</Text>

          <Text style={styles.infoText}>Best ingredients</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>⭐ Featured Food</Text>

          <Text style={styles.sectionSubtitle}>Our most popular dishes</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/menu")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {featuredFoods.map((food) => (
        <TouchableOpacity
          key={food.name}
          style={styles.foodCard}
          onPress={() => router.push("/menu")}
        >
          <View style={styles.foodImage}>
            <Text style={styles.foodEmoji}>{food.emoji}</Text>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>

            <Text style={styles.foodCategory}>{food.category}</Text>

            <Text style={styles.foodPrice}>Rs. {food.price}</Text>
          </View>

          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.aboutCard}
        onPress={() => router.push("/about")}
      >
        <View style={styles.aboutIconBox}>
          <Text style={styles.aboutIcon}>ℹ️</Text>
        </View>

        <View style={styles.aboutInfo}>
          <Text style={styles.aboutTitle}>About Our Restaurant</Text>

          <Text style={styles.aboutDescription}>
            Learn more about our food, services and opening hours.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        🍽️ Good food • Good mood • Good times
      </Text>

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
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 28,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    color: "#FFE8D6",
    fontSize: 14,
  },

  restaurantName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 3,
  },

  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  profileButton: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    fontSize: 23,
  },

  cartButton: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  cartIcon: {
    fontSize: 23,
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 18,
  },

  menuButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  menuButtonText: {
    color: "#E85D04",
    fontSize: 17,
    fontWeight: "bold",
  },

  reservationButton: {
    backgroundColor: "#FFF1E8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  reservationButtonText: {
    color: "#C84B00",
    fontSize: 16,
    fontWeight: "bold",
  },

  infoRow: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 18,
    gap: 8,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  infoIcon: {
    fontSize: 24,
    marginBottom: 5,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },

  infoText: {
    fontSize: 10,
    color: "#777",
    marginTop: 3,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
  },

  sectionSubtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 3,
  },

  seeAll: {
    color: "#E85D04",
    fontWeight: "bold",
    fontSize: 14,
  },

  foodCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  foodImage: {
    width: 65,
    height: 65,
    backgroundColor: "#FFF1E8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  foodEmoji: {
    fontSize: 38,
  },

  foodInfo: {
    flex: 1,
    marginLeft: 14,
  },

  foodName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  foodCategory: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  foodPrice: {
    color: "#E85D04",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 5,
  },

  viewButton: {
    backgroundColor: "#E85D04",
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 8,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  aboutCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  aboutIconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#FFF1E8",
    alignItems: "center",
    justifyContent: "center",
  },

  aboutIcon: {
    fontSize: 22,
  },

  aboutInfo: {
    flex: 1,
    marginLeft: 12,
  },

  aboutTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  aboutDescription: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  arrow: {
    fontSize: 28,
    color: "#E85D04",
    marginLeft: 8,
  },

  bottomText: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    marginTop: 25,
  },

  bottomSpace: {
    height: 30,
  },
});
