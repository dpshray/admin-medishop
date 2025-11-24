export interface OrderData {
    order_code: string
    user_type: string
    name: string
    email: string
    mobile: string
    address: string
    latitude: string
    longitude: string
    description: string
    price: number
    payment_method: string
    payment_status: string
    status: string
    created_at: string
    ordered_items: OrderedItem[]
}

export interface OrderedItem {
    type: "product" | "package" | "kitbag"
    prescription_required: boolean
    prescription_image: string | null
    item_products: ItemProduct[]
    order_item_id: number
    quantity: number
    price: number
    subtotal: number
}

export interface ItemProduct {
    OIP_ID: number
    variant_id: number
    product_name: string
    variant_name: string
    required_quantity: number
    assigned_batch_numbers: AssignedBatchNumber[]
    batch_numbers_list: BatchNumberList[]
}

export interface AssignedBatchNumber {
    batch_number_id: number
    batch_number: string
    quantity: number
}

export interface BatchNumberList {
    batch_number_id: number
    quantity: number
    batch_number: string
}
export const sampleOrder: OrderData = {
    order_code: "e5YbaY",
    user_type: "USER",
    name: "John Doe",
    email: "john@gmail.com",
    mobile: "9819000000",
    address: "Lazimpat, Kathmandu",
    latitude: "27.7172",
    longitude: "85.3240",
    description: "Order for medical supplies",
    price: 4500,
    payment_method: "COD",
    payment_status: "pending",
    status: "processing",
    created_at: "2025-11-24 12:30:00",
    ordered_items: [
        {
            type: "product",
            prescription_required: true,
            prescription_image: "http://example.com/uploads/prescription-image.jpg",
            order_item_id: 501,
            quantity: 3,
            price: 650,
            subtotal: 1950,
            item_products: [
                {
                    OIP_ID: 10,
                    variant_id: 5,
                    product_name: "Paracetamol 500mg",
                    variant_name: "Strip of 10 Tablets",
                    required_quantity: 2,
                    assigned_batch_numbers: [
                        { batch_number_id: 1, batch_number: "BATCH-001", quantity: 1 },
                        { batch_number_id: 2, batch_number: "BATCH-002", quantity: 1 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 1, quantity: 50, batch_number: "BATCH-001" },
                        { batch_number_id: 2, quantity: 30, batch_number: "BATCH-002" }
                    ]
                },
                {
                    OIP_ID: 11,
                    variant_id: 7,
                    product_name: "Vitamin C",
                    variant_name: "Bottle of 60 Tablets",
                    required_quantity: 1,
                    assigned_batch_numbers: [
                        { batch_number_id: 3, batch_number: "VC-100", quantity: 1 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 3, quantity: 100, batch_number: "VC-100" }
                    ]
                }
            ]
        },

        {
            type: "package",
            prescription_required: false,
            prescription_image: null,
            order_item_id: 502,
            quantity: 1,
            price: 1500,
            subtotal: 1500,
            item_products: [
                {
                    OIP_ID: 20,
                    variant_id: 9,
                    product_name: "First Aid Kit",
                    variant_name: "Basic Package",
                    required_quantity: 200,
                    assigned_batch_numbers: [
                        { batch_number_id: 4, batch_number: "FAK-001", quantity: 100 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 4, quantity: 200, batch_number: "FAK-001" }
                    ]
                },
                {
                    OIP_ID: 21,
                    variant_id: 10,
                    product_name: "Dettol",
                    variant_name: "Liquid 250ml",
                    required_quantity: 1,
                    assigned_batch_numbers: [
                        { batch_number_id: 5, batch_number: "DTL-202", quantity: 1 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 5, quantity: 40, batch_number: "DTL-202" }
                    ]
                }
            ]
        },

        {
            type: "kitbag",
            prescription_required: false,
            prescription_image: null,
            order_item_id: 503,
            quantity: 1,
            price: 1050,
            subtotal: 1050,
            item_products: [
                {
                    OIP_ID: 30,
                    variant_id: 15,
                    product_name: "Glucose Powder",
                    variant_name: "1kg Pack",
                    required_quantity: 1,
                    assigned_batch_numbers: [
                        { batch_number_id: 6, batch_number: "GLC-555", quantity: 1 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 6, quantity: 25, batch_number: "GLC-555" },
                        { batch_number_id: 7, quantity: 25, batch_number: "GLC-5855" }
                    ]
                },
                {
                    OIP_ID: 31,
                    variant_id: 18,
                    product_name: "ORS",
                    variant_name: "Pack of 5",
                    required_quantity: 1,
                    assigned_batch_numbers: [
                        { batch_number_id: 7, batch_number: "ORS-88", quantity: 1 }
                    ],
                    batch_numbers_list: [
                        { batch_number_id: 7, quantity: 60, batch_number: "ORS-88" }
                    ]
                }
            ]
        }
    ]
}
