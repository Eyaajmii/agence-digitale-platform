// 1. الـ Type الرئيسي لجدول kpi_snapshots في Supabase
export interface KpiSnapshot {
    id: string;
    client_id: string;
    source: 'meta' | 'google-ads' | 'ga4' | 'gsc';
    created_at: string;
    data: MetaKpiData | GoogleAdsKpiData | GA4KpiData | GSCKpiData; // الـ jsonb يتشكل حسب الـ source
  }
  
  // 2. تفصيل البيانات لـ Meta Ads
  export interface MetaKpiData {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    roas?: number; // إختياري حسب الـ campaign
  }
  
  // 3. تفصيل البيانات لـ Google Ads
  export interface GoogleAdsKpiData {
    cost_micros: string; // Google ترجع الـ spend هكا بالـ micros
    impressions: string;
    clicks: string;
    conversions: number;
  }
  
  // 4. تفصيل البيانات لـ Google Analytics 4
  export interface GA4KpiData {
    rows: {
      dimensionValues: { value: string }[]; // التواريخ
      metricValues: { value: string }[];    // الـ activeUsers, sessions...
    }[];
  }
  
  // 5. تفصيل البيانات لـ Google Search Console
  export interface GSCKpiData {
    rows: {
      keys: string[]; // التاريخ
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }[];
  }
  