import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { Product, ProductPack, CartItem } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, pack: ProductPack) => void;
  removeFromCart: (productId: string, packSize: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();

  const addToCart = (product: Product, pack: ProductPack) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id && item.pack.size === pack.size,
      );
      if (existingItem) {
        return prev.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Assuming a default tinting charge of 0 for standard paints
      return [...prev, { product, pack, quantity: 1, tintingCharge: 0 }];
    });
  };

  const removeFromCart = (productId: string, packSize: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.pack.size === packSize),
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const checkout = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      const totalAmount = cartItems.reduce(
        (sum, item) =>
          sum + (item.pack.price + item.tintingCharge) * item.quantity,
        0,
      );

      // Insert into Supabase 'orders' table
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "pending",
        items: cartItems, // Saves the entire cart structure as JSONB
      });

      if (error) throw error;

      alert("Order placed successfully!");
      clearCart();
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Failed to place order: " + error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        isCheckingOut,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
