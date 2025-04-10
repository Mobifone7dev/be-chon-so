

module.exports = (sequelize, DataTypes) => {
    const WebUserRole = sequelize.define(
      `web_user`,
      {
        userEmail: {
          type: DataTypes.STRING,
          field:'user_email'
        },
        password: {
          type: DataTypes.STRING,
          field:'password'
        },
       province: {
        type: DataTypes.STRING,
        field:'province'
       },
       user_name: {
        type: DataTypes.STRING,
        field:'user_name'
       },
       status: {
        type: DataTypes.INTEGER,
        field:'status'
       },
       name: {
        type: DataTypes.STRING,
        field:'name'
       },
      },
      {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
      }
    );
  
    return WebUserRole;
  };

