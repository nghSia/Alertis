import "./SubCategoryButton.css";

type SubCategoryButtonProps = {
  label: string;
  category: string;
  subcategory: string;
};

export function SubCategoryButton({
  label,
  category,
  subcategory,
}: SubCategoryButtonProps) {
  const handleAlertClick = (category: string, subcategory: string) => {
    alert(
      `Alert button clicked! Category: ${category}, Subcategory: ${subcategory}`,
    );
  };

  return (
    <button
      className="sub-category-button"
      onClick={() => handleAlertClick(category, subcategory)}
    >
      {label}
    </button>
  );
}
