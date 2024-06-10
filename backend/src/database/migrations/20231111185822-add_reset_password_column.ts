'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'resetPassword', {
      type: Sequelize.STRING,
      allowNull: true, // Ou true/false, dependendo dos requisitos do seu aplicativo
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'resetPassword');
  },
};
