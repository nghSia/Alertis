import "./SubCategoryButton.css";
import { useSocket } from "../../contexts/SocketContext";
import { useState } from "react";

type SubCategoryButtonProps = {
  label: string;
  subcategory: string;
  category: string;
};

export function SubCategoryButton({
  label,
  subcategory,
  category,
}: SubCategoryButtonProps) {
  const { sendEmergencyAlert } = useSocket();
  const [isSending, setIsSending] = useState(false);

  const handleAlertClick = async () => {
    setIsSending(true);

    // Récupérer la géolocalisation si disponible
    let location: { latitude: number; longitude: number } | undefined;
    // console.log("localisation disponible:", location);

    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000,
            });
          },
        );
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("localisation disponible:", location);
      }
    } catch (error) {
      console.log("Géolocalisation non disponible ou refusée");
    }

    // Envoyer l'alerte via Socket.IO
    const alertData = {
      category,
      subcategory,
      timestamp: new Date().toISOString(),
      location,
      userId: localStorage.getItem("userId") || undefined,
    };

    const success = sendEmergencyAlert(alertData);

    if (success) {
      alert(
        `🚨 Alerte envoyée !\n\nCatégorie: ${category}\nType: ${label}\n\nLes secours ont été notifiés.`,
      );
    } else {
      alert(
        "❌ Erreur lors de l'envoi de l'alerte.\nVérifiez votre connexion et réessayez.",
      );
    }

    setIsSending(false);
  };

  return (
    <button
      className="sub-category-button"
      onClick={handleAlertClick}
      disabled={isSending}
    >
      {isSending ? "Envoi en cours..." : label}
    </button>
  );
}
