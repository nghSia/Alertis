import "./SubCategoryButton.css";
import { useSocket } from "../../contexts/SocketContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../confirmModal/ConfirmModa";

type SubCategoryButtonProps = {
  label: string;
  subcategory: string;
  categoryName: string;
};

export function SubCategoryButton({
  label,
  subcategory,
  categoryName,
}: SubCategoryButtonProps) {
  const { sendEmergencyAlert } = useSocket();
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || undefined;

  const handleAlertClick = async () => {
    setIsModalOpen(false);
    setIsSending(true);

    // Récupérer la géolocalisation si disponible
    let location: { latitude: number; longitude: number } | undefined;

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
      category: categoryName,
      subcategory,
      timestamp: new Date().toISOString(),
      location,
      userId,
    };

    console.log("Sending alert data:", alertData);

    const success = sendEmergencyAlert(alertData);

    if (success) {
      // Rediriger vers la page de statut de l'alerte
      navigate("/alert-status", {
        state: {
          categoryName,
          subcategoryName: label,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      alert(
        "❌ Erreur lors de l'envoi de l'alerte.\nVérifiez votre connexion et réessayez.",
      );
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        className="sub-category-button"
        onClick={() => setIsModalOpen(true)}
        disabled={isSending}
      >
        {isSending ? "Envoi en cours..." : label}
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        categoryName={categoryName}
        subcategoryName={label}
        onConfirm={handleAlertClick}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
}
