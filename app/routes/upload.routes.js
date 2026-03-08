module.exports = app => {

    const upload = require("../middleware/upload")

    const controller = require("../controllers/upload.controller")
    const analytics = require("../controllers/analytics.controller");
    const router = require("express").Router()

    router.post("/excel", upload.single("file"), controller.uploadExcel)
    router.get("/dashboard", analytics.getDashboardStats);

    
    app.use("/api/upload", router)

}