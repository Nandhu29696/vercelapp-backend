module.exports = (sequelize, Sequelize) => {

  const SupplierItems = sequelize.define("supplierItems", {

    itemId: {
      type: Sequelize.STRING
    },

    vendor: {
      type: Sequelize.STRING
    },

    poId: {
      type: Sequelize.STRING   // stores "PO 1234"
    },

    date: {
      type: Sequelize.DATE
    },

    quantity: {
      type: Sequelize.INTEGER
    },

    amount: {
      type: Sequelize.FLOAT
    },

    unitCost: {
      type: Sequelize.FLOAT
    }

  });

  return SupplierItems;
};