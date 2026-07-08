import React, { useState } from 'react';
import { ShoppingCart, Eye, Star, Tag } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80';

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const specifications = product.specifications || product.characteristics || {};

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state?.userId) { navigate('/login'); return; }
    const defaultVariations: { [key: string]: string } = {};
    product.variations?.forEach(v => {
      if (v.options.length > 0) defaultVariations[v.type] = v.options[0].name;
    });
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1, variations: defaultVariations } });
  };

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state?.userId) { navigate('/login'); return; }
    dispatch({ type: 'TOGGLE_QUOTE_MODAL', payload: product });
  };

  return (
    <motion.div
      className="product-card glass-card cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-dark-card h-48 flex items-center justify-center">
        <motion.img
          src={imageError ? FALLBACK_IMAGE : (product.image || FALLBACK_IMAGE)}
          alt={product.name}
          onError={() => setImageError(true)}
          className="max-h-36 w-auto object-contain p-4 drop-shadow-xl"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercentage > 0 && (
            <span className="badge badge-orange">-{discountPercentage}%</span>
          )}
        </div>

        {/* Quick actions */}
        <motion.div
          className="absolute top-3 right-3 flex flex-col gap-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white hover:bg-electric-blue/30 transition-colors shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Electric accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-electric-blue/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30'}`} />
          ))}
          <span className="text-xs text-slate-500 ml-1">(100+)</span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-200 mb-2 line-clamp-2 group-hover:text-white transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Specs */}
        {Object.keys(specifications).length > 0 && (
          <div className="mb-3 space-y-1">
            {Object.entries(specifications).slice(0, 2).map(([key, value], i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-slate-500">
                <span className="text-electric-blue/60">▸</span>
                <span className="font-medium text-slate-400">{key}:</span>
                <span className="truncate">{value as string}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xl font-bold gradient-text">
              {product.price.toLocaleString()} <span className="text-sm font-normal">TND</span>
            </div>
            {product.originalPrice && (
              <div className="text-xs text-slate-500 line-through">
                {product.originalPrice.toLocaleString()} TND
              </div>
            )}
          </div>
          <span className="badge badge-green text-xs">Disponible</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-electric-blue/15 hover:bg-electric-blue/25 border border-electric-blue/25 hover:border-electric-blue/50 text-electric-blue text-sm font-medium py-2 rounded-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={handleRequestQuote}
            className="flex items-center justify-center gap-1.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 hover:border-orange-500/50 text-orange-400 text-sm font-medium px-3 py-2 rounded-lg transition-all"
          >
            <Tag className="w-4 h-4" />
            Devis
          </button>
        </div>
      </div>
    </motion.div>
  );
}
