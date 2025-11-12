//Query Constant
const QUERY_STALE_TIME = 30000;
const QUERY_REFETCH_INTERVAL = 5000;


//Pagination Constant
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

//Stock Constant
const LOW_STOCK_THRESHOLD = 10;
const OUT_OF_STOCK = 0;


//Payment Constant
const PAYMENT_PREFIX = "Npr" satisfies string
const CURRENCY_SYMBOL = "Npr";


//File Constant
const MAX_FILE_SIZE = 5 * 1024 * 1024


export {
    LOW_STOCK_THRESHOLD,
    OUT_OF_STOCK,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    QUERY_STALE_TIME,
    PAGE_SIZE_OPTIONS,
    PAYMENT_PREFIX,
    QUERY_REFETCH_INTERVAL,
    MAX_FILE_SIZE,
    CURRENCY_SYMBOL
}