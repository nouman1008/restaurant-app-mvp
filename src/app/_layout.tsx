import React from "react";
import { Stack } from "expo-router";

import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { OrdersProvider } from "../context/OrdersContext";
import { ReservationProvider } from "../context/ReservationContext";
import { MenuProvider } from "../context/MenuContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <ReservationProvider>
              <MenuProvider>
                <Stack>
                  <Stack.Screen name="login" options={{ headerShown: false }} />

                  <Stack.Screen
                    name="home"
                    options={{ title: "Restaurant App" }}
                  />

                  <Stack.Screen name="menu" options={{ title: "Menu" }} />

                  <Stack.Screen name="cart" options={{ title: "Your Cart" }} />

                  <Stack.Screen
                    name="checkout"
                    options={{ title: "Checkout" }}
                  />

                  <Stack.Screen
                    name="confirmation"
                    options={{ title: "Order Confirmed" }}
                  />

                  <Stack.Screen
                    name="food-details"
                    options={{ title: "Food Details" }}
                  />

                  <Stack.Screen
                    name="about"
                    options={{ title: "About Restaurant" }}
                  />

                  <Stack.Screen
                    name="reservation"
                    options={{ title: "Reservation" }}
                  />

                  <Stack.Screen
                    name="manager"
                    options={{ title: "Manager Dashboard" }}
                  />

                  <Stack.Screen
                    name="profile"
                    options={{ title: "My Profile" }}
                  />

                  <Stack.Screen
                    name="order-tracking"
                    options={{ title: "Order Tracking" }}
                  />
                </Stack>
              </MenuProvider>
            </ReservationProvider>
          </OrdersProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
