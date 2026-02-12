import { supabase } from "../integrations/supabase/client";

export interface Alert {
  id: string;
  category_name: string;
  subcategory_name: string;
  client_first_name: string;
  client_last_name: string;
  created_at: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'accepted' | 'resolved';
  patrol_id?: string;
}

/**
 * Récupère les alertes filtrées par type de patrouille et statut
 * Utilise les relations: alerts → sub_categories → categories
 */
export const getAlertsByStatus = async (
  patrolType: string,
  status: 'pending' | 'accepted' | 'resolved'
): Promise<Alert[]> => {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select(`
        *,
        clients!inner(first_name, last_name),
        sub_categories!inner(
          name,
          categories!inner(name, patrol_type)
        )
      `)
      .eq("sub_categories.categories.patrol_type", patrolType)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors du chargement des alertes:", error);
      throw error;
    }

    return data.map((alert: any) => ({
      id: alert.id,
      category_name: alert.sub_categories.categories.name,
      subcategory_name: alert.sub_categories.name,
      client_first_name: alert.clients.first_name,
      client_last_name: alert.clients.last_name,
      created_at: alert.created_at,
      latitude: parseFloat(alert.alert_location.split('(')[1].split(',')[0]),
      longitude: parseFloat(alert.alert_location.split(',')[1].split(')')[0]),
      status: alert.status,
      patrol_id: alert.patrol_id
    }));
  } catch (error) {
    console.error("Erreur getAlertsByStatus:", error);
    throw error;
  }
};

/**
 * Met à jour le statut d'une alerte et récupère les données mises à jour
 */
export const updateAlertStatusInDB = async (
  alertId: string,
  status: 'pending' | 'accepted' | 'resolved',
  patrolId?: string
) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (patrolId && status === 'accepted') {
      updateData.patrol_id = patrolId;
      updateData.accepted_at = new Date().toISOString();
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", alertId)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de l'alerte:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur updateAlertStatusInDB:", error);
    throw error;
  }
};

/**
 * Récupère une alerte spécifique avec tous ses détails
 */
export const getAlertById = async (alertId: string): Promise<Alert | null> => {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select(`
        *,
        clients!inner(first_name, last_name),
        sub_categories!inner(
          name,
          categories!inner(name, patrol_type)
        )
      `)
      .eq("id", alertId)
      .single();

    if (error) {
      console.error("Erreur lors du chargement de l'alerte:", error);
      return null;
    }

    return {
      id: data.id,
      category_name: data.sub_categories.categories.name,
      subcategory_name: data.sub_categories.name,
      client_first_name: data.clients.first_name,
      client_last_name: data.clients.last_name,
      created_at: data.created_at,
      latitude: parseFloat(data.alert_location.split('(')[1].split(',')[0]),
      longitude: parseFloat(data.alert_location.split(',')[1].split(')')[0]),
      status: data.status,
      patrol_id: data.patrol_id
    };
  } catch (error) {
    console.error("Erreur getAlertById:", error);
    return null;
  }
};

/**
 * Récupère le type de patrouille basé sur l'ID du client
 */
export const getClientAlerts = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select(`
        *,
        sub_categories!inner(
          categories!inner(patrol_type)
        )
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors du chargement des alertes du client:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur getClientAlerts:", error);
    throw error;
  }
};

