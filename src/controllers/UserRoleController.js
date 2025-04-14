const oracledb = require("oracledb");
oracledb.autoCommit = true;
const db = require("../models");
const fs = require("fs");
const { sequelize } = require('../models'); // Import s
const { query, validationResult } = require("express-validator");

class UserRoleController {
    index(req, res) {
        res.send({ result: "hello wolrd" });

    }
    async getUserRole(req, res) {
        var userEmail = req.query.userEmail;
        try {
            const roles = await sequelize.query(
                `select a.user_email, a.menu_id, a.select_role,a.edit_role, a.ttoan_role,  b.province, c.menu_name from web_user_email a 
          left join web_user b on a.user_email =  b.user_email 
          left join menu c on c.menu_id = a.menu_id
          where a.user_email =:userEmail `,
                {
                    replacements: { userEmail: userEmail },
                    type: sequelize.QueryTypes.SELECT,
                });

            res.json({
                roles: roles
            });
        } catch (error) {
            console.log("error", error)
            res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.
        }

    }
    async getWebUser(req, res) {
        var userEmail = req.query.userEmail;
        let sql = `select * from web_user where user_email =:userEmail`;
        if (userEmail) {
            const data = await sequelize.query(
                sql,
                {
                    replacements: { userEmail: userEmail },
                    type: sequelize.QueryTypes.SELECT,
                });

            res.status(200).json({ result: data }); // This runs as well.

        } else {
            res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.

        }

    }

    async updateUserRole(req, res) {
        const result = validationResult(req);
        if (result.isEmpty()) {
            let userEmail = req.body.userEmail;
            let province = req.body.province;
            let roles = req.body.roles;
            try {

                const existingUserEmail = await sequelize.query(
                    `SELECT * FROM web_user where 
                    user_email = :userEmail
                   `,
                    {
                        replacements: { userEmail: userEmail },
                        type: sequelize.QueryTypes.SELECT,
                    });
                if (existingUserEmail) {
                    if (province && province.length > 0) {
                        await sequelize.query(
                            `update web_user
                             set province =:province
                                WHERE user_email = :userEmail
                                `,
                            {
                                replacements: {
                                    province: province,
                                    userEmail: userEmail
                                },
                                type: sequelize.QueryTypes.UPDATE,
                            }
                        );
                    } else {
                        await sequelize.query(
                            `update web_user
                             set province =:province
                                WHERE user_email = :userEmail
                                `,
                            {
                                replacements: {
                                    province: null,
                                    userEmail: userEmail
                                },
                                type: sequelize.QueryTypes.UPDATE,
                            }
                        );
                    }


                }

                if (roles && roles.length > 0) {
                    await sequelize.query(
                        `delete from web_user_email 
                            WHERE user_email = :userEmail
                            `,
                        {
                            replacements: {
                                userEmail: userEmail
                            },
                            type: sequelize.QueryTypes.DELETE,
                        }
                    );

                    for (const role of roles) {
                        await sequelize.query(
                            `insert into  web_user_email 
                                (
                                user_email,
                                menu_id,
                                select_role,
                                edit_role,
                                ttoan_role
                        ) values
                                (
                                :userEmail,
                                :menuId,
                                :selectRole,
                                :editRole,
                                :ttoanRole
                                )
                                  `,
                            {
                                replacements: {
                                    userEmail: userEmail,
                                    menuId: role.MENU_ID,
                                    selectRole: role.SELECT_ROLE,
                                    editRole: role.EDIT_ROLE,
                                    ttoanRole: role.TTOAN_ROLE,
                                },
                                type: sequelize.QueryTypes.INSERT,
                            }
                        );
                    }
                }
                res.send({ data: { sussess: true } })

            } catch (error) {
                throw new Error(`Có lỗi xảy ra:  ${error}`)

            }
        }
    }

}
module.exports = new UserRoleController();
