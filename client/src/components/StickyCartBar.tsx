import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";

interface Props {
  product: Omit<CartItem, "quantity">;
  available: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export default function StickyCartBar({ product, available, triggerRef }: Props) {
  const { addItem, isInCart } = useCart();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  // Show the bar only after the main "Add to Cart" button scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (triggerRef.current) observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [triggerRef]);

  if (!available) return null;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
        background: "rgba(250,250,247,0.97)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(45,44,44,0.1)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Product thumbnail */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 44, height: 44, background: "#EAEADF" }}
        >
          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
        </div>

        {/* Name + price */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate" style={{ color: "#2D2C2C" }}>{product.name}</div>
          <div className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{product.price} · {product.size}</div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300"
          style={{
            background: added ? "#6B7A3E" : "#2D2C2C",
            color: "#EAEADF",
            minWidth: 120,
            justifyContent: "center",
          }}
        >
          <ShoppingBag size={13} />
          {added ? "Added ✓" : isInCart(product.id) ? "Add Again" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
