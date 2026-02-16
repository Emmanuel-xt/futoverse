import { useQuery } from "@tanstack/react-query";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";

export const useShops = () => {
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const response = await fetchOnlyShops();
      if (!response.success || !Array.isArray(response.shops)) {
        throw new Error("Failed to fetch shops");
      }
      return response.shops;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: true,
    refetchOnWindowFocus: false,
  });
};
