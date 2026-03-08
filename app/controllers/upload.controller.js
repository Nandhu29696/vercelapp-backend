const XLSX = require("xlsx")
const db = require("../models")

const Taxonomy = db.taxonomy
const SpendData = db.spendData
const SupplierItems = db.supplierItems
const logger = require("../logger/logger")

function parseCurrency(value) {

    if (!value) return 0

    let str = String(value).trim()

    // Handle "$ -" or "-"
    if (str === "$ -" || str === "-" || str === "$-") {
        return 0
    }

    // Remove $ and commas
    str = str.replace(/\$/g, "").replace(/,/g, "")

    const num = parseFloat(str)

    return isNaN(num) ? 0 : num
}

function parseExcelDate(value) {
    if (!value) return null

    // Excel numeric date
    if (typeof value === "number") {
        return new Date((value - 25569) * 86400 * 1000)
    }

    // String date DD-MM-YYYY
    const parts = value.split("-")
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    }

    return null
}


exports.uploadExcel = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).send("Please upload an Excel file")
        }

        const workbook = XLSX.readFile(req.file.path)

        // ===== TAXONOMY SHEET =====
        const taxonomySheet = workbook.Sheets["Taxonomy"]

        if (taxonomySheet) {

            const taxonomyData = XLSX.utils.sheet_to_json(taxonomySheet)

            await Taxonomy.bulkCreate(
                taxonomyData.map(row => ({
                    categoryL4: row["Category L4"],
                    supplier: row["Supplier"],
                    supplierId: row["Supplier Id"],
                    contracted: row["Contracted"],
                    region: row["Region"]
                }))
            )

        }

        // ===== SPEND DATA SHEET =====
        const spendSheet = workbook.Sheets["Spend data sample"]

        if (spendSheet) {

            const spendData = XLSX.utils.sheet_to_json(spendSheet)

            await SpendData.bulkCreate(
                spendData.map(row => {

                    const debit = row["Debit"] || row[" Debit "] || row["Debit "] || null
                    const credit = row["Credit"] || row[" Credit "] || row["Credit "] || null

                    return {
                        account: row["Account"],
                        paymentType: row["Payment type"],
                        date: parseExcelDate(row["Date"]),
                        quantity: row["Quantity"],
                        debit: debit ? parseCurrency(debit) : 0,
                        credit: credit ? parseCurrency(credit) : 0,
                        supplierId: row["Supplier Id"]
                    }

                })
            )

        }

        // ===== SUPPLIER ITEMS SHEET =====
        const supplierSheet = workbook.Sheets["Supplier specific example"]

        if (supplierSheet) {

            const supplierItems = XLSX.utils.sheet_to_json(supplierSheet)

            await SupplierItems.bulkCreate(
                supplierItems.map(row => ({
                    itemId: row["item id"],
                    vendor: row["Vendor"],
                    poId: row["po id"],
                    date: row["Date"],
                    quantity: row["Quantity"],
                    amount: row["Amount"],
                    unitCost: row["Unit Cost"]
                }))
            )

        }

        res.status(200).send({
            message: "Excel data imported successfully"
        })

    } catch (error) {

        console.error(error)

        res.status(500).send({
            message: "Error importing data",
            error: error.message
        })

    }

}