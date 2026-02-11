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
          { id: "malaise", label: "Malaise" },
          { id: "accident", label: "Accident" },
          { id: "blessure", label: "Blessure" },
        ]}
      />

      <CategoryAccordion
        categoryId="danger"
        label="Danger"
        subCategories={[
          { id: "agression", label: "Agression" },
          { id: "menace", label: "Menace" },
          { id: "vol", label: "Vol" },
        ]}
      />

      <CategoryAccordion
        categoryId="incendie"
        label="Incendie"
        subCategories={[
          { id: "feu", label: "Feu" },
          { id: "fumee", label: "Fumée" },
          { id: "explosion", label: "Explosion" },
        ]}
      />
    </div>
  );
};
