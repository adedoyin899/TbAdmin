export interface PostHogEvent {
  id: string;
  event: string;
  distinct_id: string;
  timestamp: string;
  properties: Record<string, any>;
  elements?: any[];
}

export interface PostHogPerson {
  id: string;
  distinct_ids: string[];
  properties: {
    email?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    country?: string;
    country_code?: string;
    signup_source?: string;
    plan_tier?: string;
    created_at?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface PostHogFunnelStep {
  name: string;
  count: number;
  order: number;
  converted_people_url?: string;
  dropped_people_url?: string;
}

export interface PostHogInsightResult<T = any> {
  result: T;
  is_cached?: boolean;
  last_refresh?: string;
}

export interface PostHogFilterParams {
  date_from?: string;
  date_to?: string;
  properties?: Array<{
    key: string;
    value: string | number;
    operator?: string;
    type?: string;
  }>;
}
