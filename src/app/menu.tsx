import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { useCart } from "../context/CartContext";
import { useMenu, MenuItem } from "../context/MenuContext";

const categories = [
  "All",
  "Starters",
  "Mains",
  "Burgers",
  "Pizza",
  "Pakistani",
  "Fast Food",
  "Drinks",
  "Desserts",
];

type MenuItemCardProps = {
  item: MenuItem;
  isFavorite: boolean;
  onPress: (item: MenuItem) => void;
  onFavorite: (id: string) => void;
  onAdd: (item: MenuItem) => void;
};

const MenuItemCard = memo(function MenuItemCard({
  item,
  isFavorite,
  onPress,
  onFavorite,
  onAdd,
}: MenuItemCardProps) {
  const unavailable = !item.isAvailable;

  return (
    <View style={[styles.foodCard, unavailable && styles.unavailableCard]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.foodMain}
        disabled={unavailable}
        onPress={() => onPress(item)}
      >
        <View style={styles.foodImage}>
          <Text style={styles.foodEmoji}>{item.image}</Text>
        </View>

        <View style={styles.foodInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.foodName, unavailable && styles.disabledText]}>
              {item.name}
            </Text>

            {item.isSpecial && !unavailable && (
              <View style={styles.specialBadge}>
                <Text style={styles.specialText}>SPECIAL</Text>
              </View>
            )}
          </View>

          <Text style={[styles.category, unavailable && styles.disabledText]}>
            {item.category}
          </Text>

          <Text
            style={[styles.description, unavailable && styles.disabledText]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <Text style={[styles.price, unavailable && styles.disabledText]}>
            Rs. {item.price}
          </Text>

          {unavailable && (
            <Text style={styles.unavailableLabel}>Currently Unavailable</Text>
          )}
        </View>
      </TouchableOpacity>

      {!unavailable && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavorite(item.id)}
          >
            <Text style={styles.favoriteText}>{isFavorite ? "❤️" : "♡"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAdd(item)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default function MenuScreen() {
  const { addToCart } = useCart();
  const { menuItems } = useMenu();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [favorites, setFavorites] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSearchRef = useRef("");

  const renderCount = useRef(0);
  renderCount.current += 1;

  /*
   * Q4:
   * Simulate fetching menu data using a Promise.
   * The mock request takes 1.5 seconds.
   */
  const loadMenu = useCallback(() => {
    setIsLoading(true);
    setError("");

    const timer = setTimeout(() => {
      Promise.resolve(menuItems)
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setError("Unable to load menu. Please try again.");
          setIsLoading(false);
        });
    }, 1500);

    return () => clearTimeout(timer);
  }, [menuItems]);

  useEffect(() => {
    const cleanup = loadMenu();

    return cleanup;
  }, [loadMenu]);

  /*
   * Q5:
   * Manual debounce using useRef.
   * Search is processed after 400ms.
   */
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const value = search.trim();

      setDebouncedSearch(value);

      /*
       * previousSearchRef prevents duplicate consecutive searches.
       */
      if (
        value.length > 0 &&
        value.toLowerCase() !== previousSearchRef.current.toLowerCase()
      ) {
        setRecentSearches((previous) => {
          const updated = [
            value,
            ...previous.filter(
              (item) => item.toLowerCase() !== value.toLowerCase(),
            ),
          ];

          return updated.slice(0, 5);
        });

        previousSearchRef.current = value;
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  /*
   * Q8:
   * Derived data is calculated with useMemo.
   * We do not store filteredItems in state.
   */
  const filteredItems = useMemo(() => {
    const searchText = debouncedSearch.toLowerCase();

    let result = menuItems.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" || item.category === selectedCategory;

      const searchMatch =
        searchText === "" ||
        item.name.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText);

      return categoryMatch && searchMatch;
    });

    if (sortOption === "low-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortOption === "high-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sortOption === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [menuItems, selectedCategory, debouncedSearch, sortOption]);

  /*
   * Pull-to-refresh.
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setError("");

    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    setShowBackToTop(offsetY > 300);
  }, []);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({
      animated: true,
      offset: 0,
    });
  }, []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, []);

  const selectRecentSearch = useCallback((value: string) => {
    setSearch(value);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, []);

  const openFoodDetails = useCallback((item: MenuItem) => {
    router.push({
      pathname: "/food-details",
      params: {
        name: item.name,
        price: String(item.price),
        emoji: item.image,
        category: item.category,
      },
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter((itemId) => itemId !== id);
      }

      return [...previous, id];
    });
  }, []);

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        emoji: item.image,
        category: item.category,
      });
    },
    [addToCart],
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => (
      <MenuItemCard
        item={item}
        isFavorite={favorites.includes(item.id)}
        onPress={openFoodDetails}
        onFavorite={toggleFavorite}
        onAdd={handleAddToCart}
      />
    ),
    [favorites, openFoodDetails, toggleFavorite, handleAddToCart],
  );

  /*
   * Q4 error state + Retry button.
   */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>!</Text>

        <Text style={styles.errorTitle}>Menu Loading Failed</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadMenu}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E85D04" />

        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Our Menu</Text>

          <Text style={styles.count}>{filteredItems.length} items</Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={focusSearch} style={styles.searchIconButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>

        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search food..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentSearches.length > 0 && search.length === 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent searches</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.recentChip}
                onPress={() => selectRecentSearch(item)}
              >
                <Text style={styles.recentText}>🔍 {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selected && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selected && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort:</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOption === "default" && styles.selectedSort,
            ]}
            onPress={() => setSortOption("default")}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === "default" && styles.selectedSortText,
              ]}
            >
              Default
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOption === "low-high" && styles.selectedSort,
            ]}
            onPress={() => setSortOption("low-high")}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === "low-high" && styles.selectedSortText,
              ]}
            >
              Price ↑
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOption === "high-low" && styles.selectedSort,
            ]}
            onPress={() => setSortOption("high-low")}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === "high-low" && styles.selectedSortText,
              ]}
            >
              Price ↓
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOption === "name" && styles.selectedSort,
            ]}
            onPress={() => setSortOption("name")}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === "name" && styles.selectedSortText,
              ]}
            >
              A-Z
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Text style={styles.debugText}>Render count: {renderCount.current}</Text>

      <FlatList
        ref={listRef}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#E85D04"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>

            <Text style={styles.emptyTitle}>No food found</Text>

            <Text style={styles.emptyText}>
              Try another food name or category.
            </Text>

            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={clearSearch}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {showBackToTop && (
        <TouchableOpacity style={styles.backToTopButton} onPress={scrollToTop}>
          <Text style={styles.backToTopText}>↑ Top</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.viewCartButton}
        onPress={() => router.push("/cart")}
      >
        <Text style={styles.viewCartText}>🛒 View Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7F7F7",
  },

  loadingText: {
    marginTop: 10,
    color: "#777",
    fontSize: 15,
  },

  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE5E5",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#B00020",
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  errorText: {
    marginTop: 8,
    textAlign: "center",
    color: "#777",
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#E85D04",
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 22,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  header: {
    backgroundColor: "#E85D04",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },

  count: {
    color: "#FFE8D6",
    fontSize: 13,
    marginTop: 3,
  },

  cartButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  cartIcon: {
    fontSize: 22,
  },

  searchContainer: {
    height: 50,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIconButton: {
    padding: 5,
  },

  searchIcon: {
    fontSize: 18,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingHorizontal: 8,
  },

  clearText: {
    fontSize: 18,
    color: "#888",
    padding: 5,
  },

  recentContainer: {
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  recentTitle: {
    color: "#555",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },

  recentChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 7,
  },

  recentText: {
    color: "#666",
    fontSize: 12,
  },

  categoryWrapper: {
    height: 52,
    marginBottom: 2,
  },

  categoryList: {
    paddingHorizontal: 15,
    alignItems: "center",
  },

  categoryButton: {
    height: 40,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  selectedCategory: {
    backgroundColor: "#E85D04",
  },

  categoryButtonText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },

  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 3,
  },

  sortLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginRight: 8,
  },

  sortButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    marginRight: 6,
  },

  selectedSort: {
    backgroundColor: "#333333",
  },

  sortText: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
  },

  selectedSortText: {
    color: "#FFFFFF",
  },

  debugText: {
    textAlign: "right",
    paddingHorizontal: 15,
    color: "#AAAAAA",
    fontSize: 10,
    marginBottom: 3,
  },

  listContent: {
    paddingTop: 5,
    paddingBottom: 100,
  },

  foodCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 12,
    borderRadius: 15,
  },

  foodMain: {
    flexDirection: "row",
  },

  unavailableCard: {
    backgroundColor: "#E5E5E5",
    opacity: 0.65,
  },

  foodImage: {
    width: 78,
    height: 78,
    backgroundColor: "#FFF1E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  foodEmoji: {
    fontSize: 40,
  },

  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  foodName: {
    color: "#222",
    fontSize: 16,
    fontWeight: "bold",
  },

  specialBadge: {
    backgroundColor: "#FFF1E8",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 7,
  },

  specialText: {
    color: "#E85D04",
    fontSize: 9,
    fontWeight: "bold",
  },

  category: {
    color: "#888",
    fontSize: 11,
    marginTop: 3,
  },

  description: {
    color: "#777",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },

  price: {
    color: "#E85D04",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 5,
  },

  disabledText: {
    color: "#777",
  },

  unavailableLabel: {
    color: "#A00000",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },

  favoriteButton: {
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  favoriteText: {
    fontSize: 24,
  },

  addButton: {
    backgroundColor: "#E85D04",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  emptyText: {
    color: "#777",
    marginTop: 5,
    textAlign: "center",
  },

  clearSearchButton: {
    marginTop: 15,
    backgroundColor: "#E85D04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  clearSearchButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  backToTopButton: {
    position: "absolute",
    right: 18,
    bottom: 80,
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },

  backToTopText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },

  viewCartButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#E85D04",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },

  viewCartText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
