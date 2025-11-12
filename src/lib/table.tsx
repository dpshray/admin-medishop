type ProductCellProps<T> = {
    product: T
    nameKey?: keyof T
    variationKey?: keyof T
}

const ProductCell = <T extends Record<string, any>>({
                                                        product,
                                                        nameKey = "product_name",
                                                        variationKey = "variation_name",
                                                    }: ProductCellProps<T>) => (
    <div className="flex flex-col gap-0.5 max-w-[150px]">
    <span className="font-medium text-sm truncate" title={String(product[nameKey] ?? "")}>
      {product[nameKey] ?? "—"}
    </span>
        <span className="text-xs text-muted-foreground truncate" title={String(product[variationKey] ?? "")}>
      {product[variationKey] ?? "—"}
    </span>
    </div>
)

ProductCell.displayName = "ProductCell"

type SizeCellProps<T = number> = {
    value?: T | null
    unit?: string
}

const SizeCell = <T extends number | string>({ value, unit }: SizeCellProps<T>) => (
    <span className="text-sm whitespace-nowrap tabular-nums">
    {value ?? "—"} {unit ?? ""}
  </span>
)

SizeCell.displayName = "SizeCell"

type PriceCellProps<T = number> = {
    price?: T | null
}

const PriceCell = <T extends number | null | undefined>({ price }: PriceCellProps<T>) => {
    const displayPrice =
        typeof price === "number" && !isNaN(price)
            ? price.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "—"

    return <div className="text-right font-medium text-sm tabular-nums">{displayPrice}</div>
}

PriceCell.displayName = "PriceCell"

export { ProductCell, SizeCell, PriceCell }
