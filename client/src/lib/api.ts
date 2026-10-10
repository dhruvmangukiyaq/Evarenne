import type { CatalogResponse, Product, ProductResponse, QuoteResponse, SearchResponse } from "./api-types";

/** Thin typed fetch wrapper around the Evarenne API. */

export class ApiError extends Error {
  readonly status: number;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(status: number, message: string, issues: Array<{ path: string; message: string }> = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        accept: "application/json",
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Network error — check your connection and try again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let issues: Array<{ path: string; message: string }> = [];
    try {
      const body = (await response.json()) as { error?: string; issues?: typeof issues };
      if (body.error) message = body.error;
      if (body.issues) issues = body.issues;
    } catch {
      // keep default message
    }
    throw new ApiError(response.status, message, issues);
  }

  return (await response.json()) as T;
}

export interface CatalogParams {
  category?: string;
  diamondType?: string;
  q?: string;
  shapes?: string[];
  metals?: string[];
  styles?: string[];
  cuts?: string[];
  colors?: string[];
  clarities?: string[];
  caratMin?: number;
  caratMax?: number;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}

function toQueryString(params: CatalogParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  catalog: (params: CatalogParams) => request<CatalogResponse>(`/api/catalog${toQueryString(params)}`),
  product: (slugOrId: string) =>
    request<ProductResponse>(`/api/products/${encodeURIComponent(slugOrId)}`),
  search: (q: string) => request<SearchResponse>(`/api/search${toQueryString({ q })}`),
  home: () => request<{ featured: Product[]; dataSource: string }>("/api/home"),
  quote: (items: Array<{ productId?: string; settingId?: string; diamondId?: string; quantity: number }>) =>
    request<QuoteResponse>("/api/pricing/quote", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
};
