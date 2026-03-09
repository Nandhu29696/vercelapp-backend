module.exports = (sequelize, Sequelize) => {

  const Taxonomy = sequelize.define("taxonomy", {

    categoryL4: {
      type: Sequelize.STRING
    },

    supplier: {
      type: Sequelize.STRING
    },

    supplierId: {
      type: Sequelize.STRING,
      allowNull: false
    },

    contracted: {
      type: Sequelize.BOOLEAN
    },

    region: {
      type: Sequelize.STRING
    }

  });

  return Taxonomy;
};