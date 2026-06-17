"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import productService from "@/service/product/product.service";
import { PaginatedResponse, ParamsType } from "@/types/types";
import { toast } from "sonner";
import { PageParams } from "@/config/app-constant";

interface UseProductsOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export function useProducts(
  params: ParamsType = {},
  options?: UseProductsOptions,
) {
  const { data, isLoading, isError } = useQuery<PaginatedResponse<any>>({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await productService.getAllProducts(params);
      // console.log("Response from product Hook", res.items);
      return res;
    },
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });

  return {
    totalPages: data?.total_page ?? 0,
    products: data?.items ?? [],
    currentPage: data?.page ?? 1,
    totalItems: data?.total_items ?? 0,
    isLoading,
    isError,
  };
}

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productUuid,
      imageUuid,
    }: {
      productUuid: string;
      imageUuid: string;
    }) => {
      await productService.deleteProductImage(productUuid, imageUuid);
    },
    onSuccess: () => {
      toast.success("Product image deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: () => {
      toast.error("Failed to delete product image");
    },
  });
};

export const useDeleteVariantImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantUuid,
      imageUuid,
    }: {
      variantUuid: string;
      imageUuid: string;
    }) => {
      await productService.deleteVariantImage(variantUuid, imageUuid);
    },
    onSuccess: () => {
      toast.success("Variant image deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: () => {
      toast.error("Failed to delete variant image");
    },
  });
};

export const useGetProductForms = (params?: PageParams) => {
  return useQuery({
    queryKey: ["product-forms", params],
    queryFn: async () => {
      const res = await productService.getProductForms(params);
      return res;
    },
  });
};

export const useCreateProductForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      await productService.createProductForm(data);
    },
    onSuccess: () => {
      toast.success("Product form created successfully");
      queryClient.invalidateQueries({ queryKey: ["product-forms"] });
    },

    onError: () => {
      toast.error("Failed to create product form");
    },
  });
};

export const useUpdateProductForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: any }) => {
      await productService.updateProductForm(uuid, data);
    },
    onSuccess: () => {
      toast.success("Product form updated successfully");
      queryClient.invalidateQueries({ queryKey: ["product-forms"] });
    },

    onError: () => {
      toast.error("Failed to update product form");
    },
  });
};

export const useDeleteProductForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await productService.deleteProductForm(uuid);
    },
    onSuccess: () => {
      toast.success("Product form deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["product-forms"] });
    },

    onError: () => {
      toast.error("Failed to delete product form");
    },
  });
};

export const useDeletePackageType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await productService.deletePackageType(uuid);
    },
    onSuccess: () => {
      toast.success("Package type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["product-forms"] });
    },

    onError: () => {
      toast.error("Failed to delete package type");
    },
  });
};

export const useDeleteUnitType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await productService.deleteUnitType(uuid);
    },
    onSuccess: () => {
      toast.success("Unit type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["product-forms"] });
    },

    onError: () => {
      toast.error("Failed to delete unit type");
    },
  });
};
