import { useState } from "react";
import { SubCategoryButton } from "../subCategoryButton/SubCategoryButton";
import "./CategoryAccordion.css";

type SubCategory = {
  id: string;
  label: string;
};

type Props = {
  categoryId: string;
  label: string;
  icon: string;
  color: string;
  subCategories: SubCategory[];
};

const getIconPath = (iconName: string) => {
  switch (iconName) {
    case "Heart":
      return (
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      );
    case "ShieldAlert":
      return (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </>
      );
    case "Flame":
      return (
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
      );
    default:
      return null;
  }
};

const getColorClass = (color: string) => {
  switch (color) {
    case "blue":
      return "category-blue";
    case "orange":
      return "category-orange";
    case "red":
      return "category-red";
    default:
      return "category-blue";
  }
};

export const CategoryAccordion = ({
  categoryId,
  label,
  icon,
  color,
  subCategories,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="category-accordion">
      <button
        className={`category-header ${getColorClass(color)}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="category-header-content">
          <svg
            className="category-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {getIconPath(icon)}
          </svg>
          <span className="category-label">{label}</span>
        </div>
        <span className="category-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="sub-categories">
          {subCategories.map((sub) => (
            <SubCategoryButton
              key={sub.id}
              label={sub.label}
              subcategory={sub.id}
              category={categoryId}
              categoryName={label}
            />
          ))}
        </div>
      )}
    </div>
  );
};
