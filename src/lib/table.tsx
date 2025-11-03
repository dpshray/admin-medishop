type ProductCellProps<T> = {
    product: T;
    nameKey?: keyof T;
    variationKey?: keyof T;
};

const ProductCell = <T extends Record<string, any>>({
                                                        product,
                                                        nameKey = "product_name",
                                                        variationKey = "variation_name",
                                                    }: ProductCellProps<T>) => (
    <div className="flex flex-col gap-0.5 max-w-[150px]">
    <span className="font-medium text-sm truncate" title={String(product[nameKey])}>
      {product[nameKey]}
    </span>
        <span className="text-xs text-muted-foreground truncate" title={String(product[variationKey])}>
      {product[variationKey]}
    </span>
    </div>
);

ProductCell.displayName = "ProductCell";

type SizeCellProps<T = number> = {
    value: T;
    unit: string;
};

const SizeCell = <T extends number | string>({value, unit}: SizeCellProps<T>) => (
    <span className="text-sm whitespace-nowrap tabular-nums">
    {value} {unit}
  </span>
);

SizeCell.displayName = "SizeCell";

type PriceCellProps<T = number> = {
    price: T;
};

const PriceCell = <T extends number>({price}: PriceCellProps<T>) => (
    <div className="text-right font-medium text-sm tabular-nums">
        {price.toLocaleString("en-NP", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
    </div>
);

PriceCell.displayName = "PriceCell";

export {ProductCell, SizeCell, PriceCell};
