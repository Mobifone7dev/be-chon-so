module.exports = (sequelize, DataTypes) => {
    const manualKpi = sequelize.define(
      `chi_tieu_thuc_hien`,
      {
        nameKpi: {
          type: DataTypes.STRING,
          field:'name_kpi'
        },
        kpi: {
          type: DataTypes.STRING,
          field:'kpi'
        },
        province: {
            type: DataTypes.STRING,
            field:'province'
          },
        month: {
            type: DataTypes.DATEONLY,
            field:'month'
          },
        createdAt: {
            type: DataTypes.DATE,

        },
        updatedAt: {
            type: DataTypes.DATE,

        }
      },
      {
        freezeTableName: true,
      }
    );
  
    return manualKpi;
  };