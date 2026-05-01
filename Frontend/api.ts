import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

// ── Types ──────────────────────────────────────────────────────────────────
export interface FridgeItem {
  id: number | string;
  _id?: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Recipe {
  title?: string;
  content?: string;
  text?: string;
}

interface RecipeSuggestionResponse {
  recipes_markdown?: string;
  recipes?: string | Recipe[];
}

// ── Inventory ──────────────────────────────────────────────────────────────
export const fetchItems = (sortBy = "expiry") =>
  api.get<FridgeItem[]>(`/items/all?sortBy=${sortBy}`).then((r) => {
    const data = r.data as any;
    const items = Array.isArray(data) ? data : data.items ?? [];
    return items.map((item: any) => ({
      ...item,
      id: item.id ?? item._id,
      _id: item._id,
    }));
  });

export const updateItemQty = (id: number | string, quantity: number) =>
  api.patch(`/items/${id}`, { quantity });

export const updateItem = (id: number | string, updates: Partial<FridgeItem>) =>
  api.patch(`/items/${id}`, updates);

export const deleteItem = (id: number | string) =>
  api.delete(`/items/${id}`);

// ── Scanner ────────────────────────────────────────────────────────────────
export const scanImage = (file: File, userLabel?: string) => {
  const fd = new FormData();
  fd.append("file", file);
  if (userLabel && userLabel.trim()) {
    fd.append("userLabel", userLabel.trim());
  }
  return axios.post("/api/ocr/scan", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

// ── Recipes ────────────────────────────────────────────────────────────────
export const suggestRecipes = () =>
  api.get<Recipe[] | RecipeSuggestionResponse>("/recipes/suggest").then((r) => {
    const data = r.data as any;
    if (Array.isArray(data)) return data;
    if (typeof data.recipes_markdown === "string") {
      return [{ title: "Recipe Suggestions", content: data.recipes_markdown }];
    }
    if (Array.isArray(data.recipes)) return data.recipes;
    if (typeof data.recipes === "string") {
      return [{ title: "Recipe Suggestions", content: data.recipes }];
    }
    return [data];
  });

export const askChef = (question: string) =>
  api.post<{ answer?: string; response?: string; content?: string }>(
    "/recipes/ask",
    { question }
  );

export default api;
