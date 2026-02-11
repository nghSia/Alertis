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
  subCategories: SubCategory[];
};

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case "sante":
      return (
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      );
    case "danger":
      return (
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"></path>
      );
    case "incendie":
      return (
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
      );
    default:
      return null;
  }
};

export const CategoryAccordion = ({
  categoryId,
  label,
  subCategories,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="category-accordion">
      <button
        className={`category-header category-${categoryId}`}
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
            {getCategoryIcon(categoryId)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
