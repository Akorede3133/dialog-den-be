import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'sent'
  }
})

export default Message;