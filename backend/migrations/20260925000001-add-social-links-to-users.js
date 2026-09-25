"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "website", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Users", "github", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Users", "twitter", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Users", "instagram", { type: Sequelize.STRING, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "website");
    await queryInterface.removeColumn("Users", "github");
    await queryInterface.removeColumn("Users", "twitter");
    await queryInterface.removeColumn("Users", "instagram");
  },
};
