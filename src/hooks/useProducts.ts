import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  rating: number;
  reviews: number;
  in_stock: boolean;
  tags: string[];
  features: string[];
  images: string[];
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((product) => ({
        ...product,
        original_price: product.original_price || undefined,
        images: product.images as string[],
      })) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        original_price: data.original_price || undefined,
        images: data.images as string[],
      } as Product;
    },
    enabled: !!id,
  });
};

export const categories = [
  "All",
  "Large Plants",
  "Small Plants",
  "Hanging Plants",
  "Stems & Branches",
];
