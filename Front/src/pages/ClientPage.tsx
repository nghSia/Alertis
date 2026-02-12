import { CategoryAccordion } from "../components/categoryAccordion/CategoryAccordion";

export const ClientPage = () => {
  return (
    <div className="client-page">
      <div className="client-header">
        <h1 className="client-title">Sélectionnez le type d'urgence</h1>
        <p className="client-subtitle">
          Choisissez la catégorie qui correspond à votre situation
        </p>
      </div>
      <CategoryAccordion
        categoryId="sante"
        label="Santé"
        subCategories={[
          { id: "Malaise", label: "Malaise" },
          { id: "Accident", label: "Accident" },
          { id: "Blessure", label: "Blessure" },
        ]}
      />

      <CategoryAccordion
        categoryId="danger"
        label="Danger"
        subCategories={[
          { id: "Agression", label: "Agression" },
          { id: "Menace", label: "Menace" },
          { id: "Vol", label: "Vol" },
        ]}
      />

      <CategoryAccordion
        categoryId="incendie"
        label="Incendie"
        subCategories={[
          { id: "Feu", label: "Feu" },
          { id: "Fumée", label: "Fumée" },
          { id: "Explosion", label: "Explosion" },
        ]}
      />
    </div>
  );
};
