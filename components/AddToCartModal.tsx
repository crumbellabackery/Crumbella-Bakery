"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart-types";
import type { ProductItem } from "@/data/pricing";

interface AddToCartModalProps {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartModal({ product, isOpen, onClose }: AddToCartModalProps) {
  const { addItem } = useCart();
  const [selectedOption, setSelectedOption] = useState(
    product.portionOptions?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!selectedOption) return;

    const cartItem: CartItem = {
      id: `${product.id}-${selectedOption.portionType}`,
      type: "product",
      name: product.name,
      description: product.description,
      quantity,
      unitPrice: selectedOption.unitPrice,
      portionType: selectedOption.portionType,
      totalPrice: quantity * selectedOption.unitPrice,
    };

    addItem(cartItem);
    onClose();
    setQuantity(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-luxury-bg rounded-3xl p-6 shadow-2xl sm:rounded-2xl animate-in slide-in-from-bottom-5 duration-300 pb-24 sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-luxury-text">
              {product.name}
            </h2>
            {product.description && (
              <p className="mt-1 text-sm text-luxury-text/70">
                {product.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-luxury-text/60 hover:text-luxury-text transition"
          >
            ×
          </button>
        </div>

        {/* Portion Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-semibold text-luxury-accent uppercase tracking-wider">
            Porsiyon Seçin
          </label>
          <div className="space-y-2">
            {product.portionOptions?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 transition ${
                  selectedOption?.portionType === option.portionType
                    ? "bg-luxury-accent text-luxury-bg"
                    : "bg-luxury-primary/40 hover:bg-luxury-primary/60 text-luxury-text"
                }`}
              >
                <span className="font-medium">{option.portionType}</span>
                <span className="font-bold">₺{option.unitPrice}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-semibold text-luxury-accent uppercase tracking-wider">
            Miktar
          </label>
          <div className="flex items-center justify-center gap-3 bg-luxury-primary/30 rounded-lg p-2.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-luxury-accent/20 hover:bg-luxury-accent/30 flex items-center justify-center text-luxury-accent text-base transition"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0) setQuantity(val);
              }}
              className="w-12 text-center bg-transparent text-xl font-bold text-luxury-text"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-luxury-accent/20 hover:bg-luxury-accent/30 flex items-center justify-center text-luxury-accent text-base transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-luxury-accent/15 to-luxury-secondary/10 border border-luxury-accent/40 shadow-soft-sm">
          <div className="flex justify-between items-center text-xs text-luxury-text/70 mb-2.5">
            <span className="opacity-90">{quantity} × ₺{selectedOption?.unitPrice || 0}</span>
          </div>
          <div className="h-px bg-luxury-accent/25 mb-2.5"></div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm text-luxury-text">Toplam</span>
            <span className="text-xl font-bold text-luxury-accent">
              ₺{(quantity * (selectedOption?.unitPrice || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 -mt-1 relative z-60">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-luxury-accent/30 hover:bg-luxury-primary/40 text-luxury-text font-semibold transition"
          >
            İptal
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-luxury-accent to-luxury-secondary text-luxury-bg font-semibold hover:shadow-soft-md transition"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
