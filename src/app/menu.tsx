import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";
import { useMenu } from "../context/MenuContext";
import { useTheme } from "../context/ThemeContext";

export default function MenuScreen() {
  const { menuItems } = useMenu();
  const { items: cartItems } = useCart();
  const { colors } = useTheme();

  const items = menuItems ?? [];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Default");

  const cartCount = useMemo(() => {
    return (cartItems ?? []).reduce(
      (total: number, item: any) => total + Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        items
          .map((item: any) => item.category)
          .filter((category: any) => category),
      ),
    );

    return ["All", ...uniqueCategories];
  }, [items]);

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = items.filter((item: any) => {
      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    if (sortBy === "Price: Low to High") {
      sorted.sort(
        (a: any, b: any) => Number(a.price || 0) - Number(b.price || 0),
      );
    }

    if (sortBy === "Price: High to Low") {
      sorted.sort(
        (a: any, b: any) => Number(b.price || 0) - Number(a.price || 0),
      );
    }

    if (sortBy === "Name: A to Z") {
      sorted.sort((a: any, b: any) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
    }

    if (sortBy === "Name: Z to A") {
      sorted.sort((a: any, b: any) =>
        String(b.name || "").localeCompare(String(a.name || "")),
      );
    }

    if (sortBy === "Special First") {
      sorted.sort(
        (a: any, b: any) =>
          Number(b.isSpecial === true) - Number(a.isSpecial === true),
      );
    }

    return sorted;
  }, [items, search, selectedCategory, sortBy]);

  const sortOptions = [
    "Default",
    "Price: Low to High",
    "Price: High to Low",
    "Name: A to Z",
    "Name: Z to A",
    "Special First",
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Our Menu
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Choose your favorite food
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
          activeOpacity={0.8}
        >
          <Text style={styles.cartIcon}>🛒</Text>

          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search food..."
          placeholderTextColor={colors.secondaryText}
          style={[
            styles.searchInput,
            {
              color: colors.text,
            },
          ]}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Categories
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((category: any) => {
          const active = selectedCategory === category;

          return (
            <Pressable
              key={String(category)}
              onPress={() => setSelectedCategory(String(category))}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: active ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text
          style={[
            styles.resultText,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          {filteredItems.length} food item
          {filteredItems.length !== 1 ? "s" : ""}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
        >
          {sortOptions.map((option) => {
            const active = sortBy === option;

            return (
              <Pressable
                key={option}
                onPress={() => setSortBy(option)}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortText,
                    {
                      color: active ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item: any, index) =>
          String(item.id || item._id || index)
        }
        renderItem={({ item }) => <MenuItemCard item={item} colors={colors} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.menuList,
          filteredItems.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No food found
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Try another search or category.
            </Text>
          </View>
        }
      />

      {cartCount > 0 && (
        <TouchableOpacity
          style={[
            styles.viewCartButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => router.push("/cart")}
          activeOpacity={0.85}
        >
          <Text style={styles.viewCartText}>View Cart ({cartCount})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MenuItemCard({ item, colors }: { item: any; colors: any }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(item);
  };

  const imageUri =
    item.name === "Chicken Biryani"
      ? "https://images.unsplash.com/photo-1589302168068-964664d93dc0"
      : item.image;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.foodImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderEmoji}>{item.emoji || "🍽️"}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.foodName,
              {
                color: colors.text,
              },
            ]}
          >
            {item.name}
          </Text>

          {item.isSpecial && (
            <View style={styles.specialBadge}>
              <Text style={styles.specialBadgeText}>SPECIAL</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text
            style={[
              styles.description,
              {
                color: colors.secondaryText,
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.price,
              {
                color: colors.primary,
              },
            ]}
          >
            Rs. {Number(item.price || 0).toLocaleString()}
          </Text>

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
              },
              item.isAvailable === false && styles.disabledButton,
            ]}
            onPress={handleAdd}
            disabled={item.isAvailable === false}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              {item.isAvailable === false ? "Unavailable" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cartIcon: {
    fontSize: 25,
  },

  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D62828",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  searchContainer: {
    height: 48,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  categoryButton: {
    minWidth: 80,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    minHeight: 40,
  },

  resultText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 10,
  },

  sortList: {
    paddingRight: 16,
  },

  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 7,
  },

  sortText: {
    fontSize: 12,
    fontWeight: "600",
  },

  menuList: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },

  foodImage: {
    width: "100%",
    height: 180,
  },

  placeholderImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderEmoji: {
    fontSize: 60,
  },

  cardContent: {
    padding: 14,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  foodName: {
    fontSize: 19,
    fontWeight: "700",
    flex: 1,
  },

  specialBadge: {
    backgroundColor: "#F4A261",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  specialBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  price: {
    fontSize: 17,
    fontWeight: "800",
  },

  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  disabledButton: {
    opacity: 0.5,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  viewCartButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  viewCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyEmoji: {
    fontSize: 55,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
