import {
  AlertButton,
  SubCategoryButton,
} from "../components/alertButton/SubCategoryButton";

export const ClientPage = () => {
  return (
    <div className="client-page">
      <SubCategoryButton
        label="Alert 1"
        category="health"
        subcategory="Malaise"
      />

      <SubCategoryButton
        label="Alert 1"
        category="health"
        subcategory="Accident"
      />

      <SubCategoryButton
        label="Alert 1"
        category="security"
        subcategory="Agression"
      />

      <SubCategoryButton
        label="Alert 1"
        category="security"
        subcategory="Accident"
      />

      <SubCategoryButton
        label="Alert 1"
        category="firefighting"
        subcategory="Incendie"
      />
    </div>
  );
};
