
export interface BusinessData {
  name: string;
  description: string;
  services: string;
  schedule: string;
  revenue: string;
  expenses: string;
  location: string;
  targetMarket: string;
  category: string;
  employees: number;
  website?: string;
  phone?: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  duration?: string;
}
