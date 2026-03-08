module.exports = (sequelize, Sequelize) => {

  const SpendData = sequelize.define("spendData", {

    account: {
      type: Sequelize.STRING
    },

    paymentType: {
      type: Sequelize.STRING
    },

    date: {
      type: Sequelize.DATE
    },

    quantity: {
      type: Sequelize.INTEGER
    },

    debit: {
      type: Sequelize.FLOAT
    },

    credit: {
      type: Sequelize.FLOAT
    },

    supplierId: {          // Excel value
      type: Sequelize.STRING
    },

    taxonomyId: {          // relation
      type: Sequelize.INTEGER
    }

  });

  return SpendData;
};