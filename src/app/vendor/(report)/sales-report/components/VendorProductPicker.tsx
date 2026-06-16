"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import vendorProductService from "@/service/product/vendor-product.service";

const QUERY_STALE_TIME = 30_000;

interface ProductItem {
  accepted: boolean;
  product_id: string;
  product_name: string;
  brand: string;
}

export interface SelectedProduct {
  product_id: string;
  product_name: string;
}

interface Props {
  selected?: SelectedProduct | null;
  onSelect: (item: SelectedProduct | null) => void;
}

export default function VendorProductPicker({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-product-picker"],
    queryFn: async () => {
      const res = await vendorProductService.getVendorProductsList({
        page: 1,
        search: "",
      });
      return res;
    },
    staleTime: QUERY_STALE_TIME,
  });

  const items: ProductItem[] = data?.items ?? [];

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }, [items, searchTerm]);

  const handleSelect = useCallback(
    (product: ProductItem) => {
      onSelect({
        product_id: product.product_id,
        product_name: product.product_name,
      });
      setOpen(false);
      setSearchTerm("");
    },
    [onSelect],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(null);
    },
    [onSelect],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearchTerm("");
    } else {
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }, 100);
    }
  }, []);

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Product
      </Label>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-72 justify-between font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              {selected && (
                <Package size={13} className="shrink-0 text-indigo-500" />
              )}
              <span className="truncate">
                {selected ? selected.product_name : "Select product…"}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-0.5">
              {selected && (
                <span
                  role="button"
                  onClick={handleClear}
                  className="rounded p-0.5 text-gray-300 hover:text-red-400"
                >
                  <X size={12} />
                </span>
              )}
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted-foreground/80 transition-transform duration-200",
                  open && "rotate-180",
                )}
                aria-hidden="true"
              />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[420px] border-input p-0"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false} aria-label="Search products">
            <CommandInput
              placeholder="Search by product or brand…"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />

            <CommandList
              ref={listRef}
              style={{
                maxHeight: 300,
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 animate-pulse rounded-lg bg-gray-100"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {filtered.map((product) => {
                      const isActive =
                        selected?.product_id === product.product_id;
                      return (
                        <CommandItem
                          key={product.product_id}
                          value={product.product_id}
                          onSelect={() => handleSelect(product)}
                          className="cursor-pointer items-start gap-3 py-2.5"
                          ref={isActive ? selectedItemRef : null}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {product.product_name}
                            </p>
                          </div>

                          {isActive && (
                            <Check
                              size={14}
                              className="ml-2 shrink-0 text-primary"
                              aria-label="selected"
                            />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
