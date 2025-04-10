module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define(
    `menu`,
    {
      menuId: {
        type: DataTypes.STRING,
        field: 'menu_id',
        primaryKey: true
      },
      menuName: {
        type: DataTypes.STRING,
        field: 'menu_name'
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    }
  );

  return Menu;
};