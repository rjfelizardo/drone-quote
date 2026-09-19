export interface BusinessSettings {
  company_id: string;
  base_price_m2: number;
  minimum_quote: number;
  travel_cost: number;
  water_cost: number;
  power_cost: number;
  whatsapp_number: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  primary_color: string;
  logo_url: string | null;
  updated_at: string;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  company_id: "default",
  base_price_m2: 8.0,
  minimum_quote: 2500,
  travel_cost: 400,
  water_cost: 250,
  power_cost: 300,
  whatsapp_number: "",
  company_name: "Drone Quote",
  company_email: "",
  company_phone: "",
  company_address: "",
  primary_color: "#1B6FC9",
  logo_url: null,
  updated_at: "",
};
