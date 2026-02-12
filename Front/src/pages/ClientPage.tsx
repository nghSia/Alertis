import { CategoryAccordion } from "../components/categoryAccordion/CategoryAccordion";
import { useEffect, useState } from "react";
import { fetchCategoriesAndSubcategories } from "../services/CategoryService";
import type { Category, SubCategory } from "../services/CategoryService";
import "./ClientPage.css";

export const ClientPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { categories, subCategories } =
        await fetchCategoriesAndSubcategories();
      setCategories(categories);
      setSubCategories(subCategories);
    };

    fetchData();
  }, []);

  return (
    <div className="client-page">
      <div className="client-header">
        <h1 className="client-title">Sélectionnez le type d'urgence</h1>
        <p className="client-subtitle">
          Choisissez la catégorie qui correspond à votre situation
        </p>
      </div>
      {categories.map((category) => (
        <CategoryAccordion
          key={category.id}
          categoryId={category.id}
          label={category.name}
          icon={category.icon}
          color={category.color}
          subCategories={subCategories
            .filter((sub) => String(sub.category.id) === String(category.id))
            .map((sub) => ({ id: sub.id, label: sub.name }))}
        />
      ))}
    </div>
  );
};
