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
 * Get alert by status
 */
export const getAlertsByStatus = async (
  patrolType: string,
  status: 'pending' | 'accepted' | 'resolved'
): Promise<Alert[]> => {
  try {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'accepted': 'in_progress',
      'resolved': 'resolved'
    };

    const dbStatus = statusMap[status] || status;

    const { data, error } = await supabase
      .from("alerts")
      .select(`
        *,
        clients(first_name, last_name),
        sub_categories!inner(
          name,
          categories!inner(name, operator_type)
        )
      `)
      .eq("status", dbStatus)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const filteredData = data.filter((alert: any) => {
      const operatorType = alert.sub_categories?.categories?.operator_type;
      const match = operatorType === patrolType;
      if (!match) {
        console.log(`❌ Alerte ${alert.id} ignorée: operator_type=${operatorType} vs patrolType=${patrolType}`);
      }
      return match;
    });

    return filteredData.map((alert: any) => ({
      id: alert.id,
      category_name: alert.sub_categories?.categories?.name || '',
      subcategory_name: alert.sub_categories?.name || '',
      client_first_name: alert.clients?.first_name || '',
      client_last_name: alert.clients?.last_name || '',
      created_at: alert.created_at,
      latitude: alert.alert_location?.lat || 0,
      longitude: alert.alert_location?.lng || 0,
      status: status as any,
      patrol_id: alert.patrol_id || undefined,
    }));
  } catch (error) {
    console.error("Erreur getAlertsByStatus:", error);
    throw error;
  }
};
