
module.exports = (sequelize, DataTypes) => {
  const WebUserRole = sequelize.define(
    `web_user_email`,
    {
      userEmail: {
        type: DataTypes.STRING,
        field: 'user_email'
      },
      menuId: {
        type: DataTypes.INTEGER,
        field: 'menu_id'
      },
      selectRole: {
        type: DataTypes.INTEGER,
        field: 'select_role'
      },
      editRole: {
        type: DataTypes.INTEGER,
        field: 'edit_role'
      },
      ttoanRole: {
        type: DataTypes.INTEGER,
        field: 'ttoan_role'
      },
      userLogin: {
        type: DataTypes.STRING,
        field: 'user_login'
      },
      ip: {
        type: DataTypes.STRING,
        field: 'ip'
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
