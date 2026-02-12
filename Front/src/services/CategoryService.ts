import { supabase } from "../integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  operatorType: string;
};

export type SubCategory = {
  id: string;
  name: string;
  category: Category;
};

type SupabaseCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  operator_type: "police" | "firefighter" | "samu";
};

type SupabaseSubCategory = {
  id: number;
  name: string;
  category_id: number | null;
};

export const fetchCategoriesAndSubcategories = async () => {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, icon, color, operator_type");

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return { categories: [], subCategories: [] };
  }

  const { data: subCategoriesData, error: subCategoriesError } = await supabase
    .from("sub_categories")
    .select("id, name, category_id");

  if (subCategoriesError) {
    console.error("Error fetching subcategories:", subCategoriesError);
    return { categories: [], subCategories: [] };
  }

  const categories: Category[] = categoriesData.map(
    (category: SupabaseCategory) => ({
      id: String(category.id),
      name: category.name,
      icon: category.icon,
      color: category.color,
      operatorType: category.operator_type,
    }),
  );

  const subCategories: SubCategory[] = subCategoriesData.map(
    (sub: SupabaseSubCategory) => {
      const category = categories.find(
        (cat) => cat.id === String(sub.category_id),
      );
      if (!category) {
        throw new Error(
          `Category with ID ${sub.category_id} not found for subcategory ${sub.name}`,
        );
      }
      return {
        id: String(sub.id),
        name: sub.name,
        category,
      };
    },
  );

  return { categories, subCategories };
};
