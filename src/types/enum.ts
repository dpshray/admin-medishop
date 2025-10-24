enum PaymentStatus {
    PAID = "PAID",
    UNPAID = "UNPAID"
}

enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    DELIVERED = "DELIVERED"
}

enum OrderType {
    PRODUCT = "Product",
    PACKAGE = "Package"
}

enum StatusType {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    DELIVERED = "DELIVERED",
    VERIFIED = "VERIFIED",
    UNVERIFIED = "UNVERIFIED",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    IN_STOCK = "IN_STOCK",
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHED = "UNPUBLISHED",

}

export {PaymentStatus, OrderStatus, OrderType, StatusType}