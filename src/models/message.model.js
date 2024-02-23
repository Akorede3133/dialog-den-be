import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: DataTypes.STRING
})

export default Message;