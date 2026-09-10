import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

// Using 'any' here temporarily to prevent TypeScript errors while we map the new fields
interface CartContextType {
  cartItems: any[];
  addToCart: (product: any, pack: any, shade?: any) => void;
  removeFromCart: (productId: string, packSize: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();

  // --- UPDATED: Now accepts shade and saves HSN code ---
  const addToCart = (product: any, pack: any, shade?: any) => {
    setCartItems((prev) => {
      // Create a unique ID for the cart item (so different shades of the same paint don't merge)
      const cartItemId = `${product.id}-${pack.size}-${shade ? shade.code : "default"}`;

      const existingItem = prev.find((item) => item.id === cartItemId);

      if (existingItem) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // Add the new item with ALL the fields expected by CartDrawer & Invoice
      return [
        ...prev, 
        { 
          id: cartItemId,
          product: product, // Kept for safety
          productName: product.name,
          image: product.image,
          pack: pack, 
          quantity: 1, 
          tintingCharge: 0,
          selectedShade: shade,
          hsn_code: product.hsn_code || "3208" // <-- HSN Code explicitly saved to the order!
        }
      ];
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