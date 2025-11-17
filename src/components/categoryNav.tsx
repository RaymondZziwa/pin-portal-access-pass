import React from 'react';
import useItemCategories from "@/hooks/useCategories";

interface CategoryNavProps {
  selectedCategory: number | string;
  onSelectCategory: (category: number | string) => void;
  setQuery: (query: string) => void;
  isMobile?: boolean;
  setCurrentPage: (orig: number) => void
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  isMobile = false, 
  setCurrentPage,
  setQuery 
}) => {
  const { data: categories } = useItemCategories();

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      <button
        onClick={() => {
          onSelectCategory(0);
          setQuery("");
          setCurrentPage(1)
        }}
        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            onSelectCategory(category.id)
            setCurrentPage(1)
          }}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-teal-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};