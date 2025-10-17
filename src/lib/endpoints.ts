export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/logingbypin',
    },
    POS: {
        GET_ALL_CATEGORIES: "/inventories/item_categories",
        GET_ALL_ITEMS:(id: string) =>  `/inventories/${id}/storeinventory`,
        RECORD_SALE: "/inventories/items",
        GET_ALL_WAREHOUSES: "/people/warehouses",
        GET_ALL_CURRENCIES: "/accounts/currencies",
        GET_ALL_PAYMENTMETHODS: "/accounts/paymentmethod"
    }
}