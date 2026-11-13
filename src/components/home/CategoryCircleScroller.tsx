import React, { useRef } from 'react';
import { Category } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryCircleScrollerProps {
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const CategoryCircleScroller: React.FC<CategoryCircleScrollerProps> = ({ categories, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getL } = useLanguage();
  const activeCategories = categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="py-4 my-2">
      {/* Borderless, clean horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none scroll-smooth px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeCategories.map(cat => {
          const catName = getL(cat, 'name');
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="flex flex-col items-center shrink-0 cursor-pointer group text-center focus:outline-hidden"
            >
              {/* 54px circular icon container with 1px subtle border */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF7F0] border border-[#ECE8DF] flex items-center justify-center p-2 group-hover:border-[#1B4D2B] transition-all duration-200">
                <img
                  src={cat.image}
                  alt={catName}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              {/* Category label */}
              <span className="mt-2 text-xs font-medium text-[#4B5563] group-hover:text-[#111827] whitespace-nowrap transition-colors">
                {catName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
