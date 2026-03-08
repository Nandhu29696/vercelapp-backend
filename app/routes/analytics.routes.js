module.exports = app => {
    const router = require("express").Router()
    app.use("/api/analytics", router)

    const analytics = require("../controllers/analytics.controller");

    router.get("/dashboard", analytics.getDashboardStats);
    router.get("/filters", analytics.getFilterValues)
    
    router.get("/spend-by-category", analytics.getSpendByCategory)
    router.get("/spend-by-region", analytics.getSpendByRegion)
    router.get("/spend-by-month-year", analytics.getSpendByMonthYear)
    router.get("/spend-by-supplier", analytics.getSpendBySupplier)
    router.get("/spend-by-contract", analytics.getSpendByContract)
    router.get("/transactionsby-month-year", analytics.getTransactionsByMonthYear)
}