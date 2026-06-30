import brandService from "@/service/brand.service";
import { useQuery } from "@tanstack/react-query";

export const useGetBrandBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["brand", slug],
    queryFn: () => brandService.getBrandBySlug(slug),
    enabled: !!slug,
  });
};
