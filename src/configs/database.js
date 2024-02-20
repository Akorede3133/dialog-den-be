import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('dialog_den', 'postgres', 'Akorede1#', {
  host: 'localhost',
  dialect: 'postgres',
  logging: console.log
});

export default sequelize;