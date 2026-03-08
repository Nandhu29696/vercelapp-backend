const db = require("../models");
const { Op, Sequelize } = require("sequelize")

const SpendData = db.spendData;
const Taxonomy = db.taxonomy;
const SupplierItems = db.supplierItems;

exports.getDashboardStats = async (req, res) => {
  try {

    const { region, year, supplier } = req.query

    const spendWhere = {}
    const taxonomyWhere = {}
    const supplierItemsWhere = {}

    // Supplier filter
    if (supplier) {
      spendWhere.supplierId = supplier
      taxonomyWhere.supplierId = supplier
      supplierItemsWhere.supplierId = supplier
    }

    // Region filter
    if (region) {
      taxonomyWhere.region = region
    }

    // Year filter (Postgres)
    if (year) {
      spendWhere.date = Sequelize.where(
        Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "date"')),
        year
      )
    }

    // Total Spend
    const spend = await SpendData.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("debit")), "totalDebit"],
        [Sequelize.fn("SUM", Sequelize.col("credit")), "totalCredit"]
      ],
      where: spendWhere,
      raw: true
    })

    // Suppliers
    const supplierCount = await Taxonomy.count({
      distinct: true,
      col: "supplierId",
      where: taxonomyWhere
    })

    // PO Count
    const poCount = await SupplierItems.count({
      distinct: true,
      col: "poId",
      where: supplierItemsWhere
    })

    // Item Count
    const itemCount = await SupplierItems.count({
      where: supplierItemsWhere
    })

    // Region Count
    const regionCount = await Taxonomy.count({
      distinct: true,
      col: "region",
      where: taxonomyWhere
    })

    // Transactions
    const transactionCount = await SpendData.count({
      where: spendWhere
    })

    res.status(200).json({
      totalDebit: parseFloat(spend?.totalDebit || 0),
      totalCredit: parseFloat(spend?.totalCredit || 0),
      suppliers: supplierCount,
      poCount: poCount,
      transactions: transactionCount,
      items: itemCount,
      regions: regionCount
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Error fetching analytics data",
      error: error.message
    })

  }
}

exports.getFilterValues = async (req, res) => {
  try {

    const regions = await Taxonomy.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("region")), "region"]
      ],
      raw: true
    })

    const years = await SpendData.findAll({
      attributes: [
        [Sequelize.literal('DISTINCT EXTRACT(YEAR FROM "date")'), "year"]
      ],
      raw: true
    })

    const suppliers = await SpendData.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("supplierId")), "supplierId"]
      ],
      order: [["supplierId", "ASC"]],
      raw: true
    })

    res.json({
      region: regions.map(r => r.region),
      year: years.map(y => y.year),
      supplier: suppliers.map(s => s.supplierId)
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching filters" })
  }
}

exports.getSpendByCategory = async (req, res) => {
  try {

    const { year, region, supplier } = req.query

    const spendWhere = {}
    const taxonomyWhere = {}

    if (supplier) spendWhere.supplierId = supplier
    if (region) taxonomyWhere.region = region

    if (year) {
      spendWhere[Sequelize.Op.and] = Sequelize.where(
        Sequelize.fn(
          "EXTRACT",
          Sequelize.literal('YEAR FROM "spendRecords"."date"')
        ),
        year
      )
    }

    const data = await Taxonomy.findAll({

      attributes: [
        "categoryL4",

        [
          Sequelize.fn("SUM", Sequelize.col("spendRecords.debit")),
          "totalDebit"
        ],

        [
          Sequelize.fn("COUNT", Sequelize.col("spendRecords.id")),
          "transactionCount"
        ]
      ],

      include: [
        {
          model: SpendData,
          as: "spendRecords",
          attributes: [],
          required: false,
          where: spendWhere
        }
      ],

      where: taxonomyWhere,

      group: ["taxonomy.categoryL4"],

      order: [[Sequelize.literal('"totalDebit"'), "DESC"]], // ✅ sort by totalDebit DESC
 

      raw: true
    })

    res.json(data)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: error.message
    })

  }
}

exports.getSpendByRegion = async (req, res) => {
  try {

    const { year, supplier } = req.query

    const where = {}

    if (supplier) where.supplierId = supplier

    if (year) {
      where[Sequelize.Op.and] = Sequelize.where(
        Sequelize.fn("EXTRACT", Sequelize.literal('YEAR FROM "spendData"."date"')),
        year
      )
    }

    const data = await SpendData.findAll({

      attributes: [
        [Sequelize.col("taxonomy.region"), "region"],
        [Sequelize.fn("SUM", Sequelize.col("debit")), "totalSpend"]
      ],

      include: [
        {
          model: Taxonomy,
          as: "taxonomy",   // 🔑 REQUIRED
          attributes: []
        }
      ],

      where,

      group: ["taxonomy.region"],

      raw: true

    })

    res.json(data)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: error.message
    })

  }
}

exports.getSpendByMonthYear = async (req, res) => {
  try {

    const data = await SpendData.findAll({

      attributes: [

        [
          Sequelize.literal(
            `TO_CHAR("date",'YYYY-MM')`
          ),
          "month"
        ],

        [
          Sequelize.fn("SUM", Sequelize.col("debit")),
          "totalSpend"
        ]

      ],

      group: [Sequelize.literal(`TO_CHAR("date",'YYYY-MM')`)],
      order: [[Sequelize.literal(`TO_CHAR("date",'YYYY-MM')`), "ASC"]],
      raw: true

    })

    res.json(data)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSpendBySupplier = async (req, res) => {
  try {

    const data = await SpendData.findAll({

      attributes: [
        "supplierId",
        [Sequelize.fn("SUM", Sequelize.col("debit")), "totalSpend"]
      ],

      group: ["supplierId"],
      order: [[Sequelize.literal('"totalSpend"'), "DESC"]],
      raw: true

    })

    res.json(data)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSpendByContract = async (req, res) => {
  try {

    const data = await SupplierItems.findAll({

      attributes: [
        "vendor",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalSpend"]
      ],

      group: ["vendor"],
      raw: true

    })

    res.json(data)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getTransactionsByMonthYear = async (req, res) => {
  try {

    const data = await SpendData.findAll({

      attributes: [

        [
          Sequelize.literal(
            `TO_CHAR("date",'YYYY-MM')`
          ),
          "month"
        ],

        [
          Sequelize.fn("COUNT", Sequelize.col("id")),
          "transactions"
        ]

      ],

      group: [Sequelize.literal(`TO_CHAR("date",'YYYY-MM')`)],
      order: [[Sequelize.literal(`TO_CHAR("date",'YYYY-MM')`), "ASC"]],
      raw: true

    })

    res.json(data)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}