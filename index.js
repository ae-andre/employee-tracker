require('dotenv').config();
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const ctable = require("console.table");

// Import required modules
const db = mysql2.createConnection({
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "employeetrackerdb",
    host: "127.0.0.1",
    port: 3306
})

// Main menu function to prompt user
function mainMenu() {
    // Prompt user to select action
    inquirer.prompt(
        [
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "Delete a department",
                    "Delete a role",
                    "Delete an employee",
                ]
    
            }
    
        ]
    )
    .then(answers => {
        // Switch case to handle different user choices
        switch(answers.action) {
            case "View all departments":
                db.query("SELECT * FROM department", function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.table(data);
                        mainMenu();
                    }
                })
                break;
            case "Add a department":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "What is the name of the new department?"
                    }
                ]).then(answers => {
                    db.query(`INSERT INTO department (name) VALUES ("${answers.name}")`, function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("created new dept")
                            mainMenu();
                        }
                    })
                }) 
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            case "View all roles":
                db.query("SELECT * FROM role", function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.table(data);
                        mainMenu();
                    }
                })
                break;            
            case "View all employees":
                db.query("SELECT * FROM employee", function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.table(data);
                        mainMenu();
                    }
                })
                break;
            case "Add a role":
                db.query("SELECT * FROM department", function(err, departments) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    const departmentChoices = departments.map(dept => ({ name: dept.name, value: dept.id }));

                    inquirer.prompt([
                        {
                            type: "input",
                            name: "title",
                            message: "What is the name of the new job title?"
                        },
                        {
                            type: "list",
                            name: "department",
                            message: "What department does the role belong to?",
                            choices: departmentChoices
                        },
                        {
                            type: "input",
                            name: "salary",
                            message: "What is the salary for the new role?"
                        },
                    ]).then(answers => {
                        db.query(`INSERT INTO role (title, department_id, salary) VALUES (?, ?, ?)`, [answers.title, answers.department, answers.salary], function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Created new role")
                                mainMenu();
                            }
                        })
                    });
                });
                break;
            case "Add an employee":
                db.query("SELECT * FROM role", function(err, roles) {
                    if (err) {
                        console.log(err);
                        return;
                    }
            
                    const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
            
                    db.query("SELECT * FROM employee", function(err, employees) {
                        if (err) {
                            console.log(err);
                            return;
                        }
            
                        const managerChoices = employees.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }));
                        managerChoices.unshift({ name: 'None', value: null });

                    inquirer.prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "What is the first name of the employee?"
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "What is the last name of the employee?"
                        },
                        {
                            type: "list",
                            name: "role",
                            message: "What role will the employee have?",
                            choices: roleChoices
                        },
                        {
                            type: "list",
                            name: "manager",
                            message: "Who is the employees manager?",
                            choices: managerChoices
                        },
                    ]).then(answers => {
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, answers.role, answers.manager || null], function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Added new employee")
                                mainMenu();
                            }
                        })
                    });
                });
            });
            break;
            case "Update an employee role":
                // Fetch employees
                db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
            
                    // Fetch roles
                    db.query('SELECT id, title FROM role', (err, roles) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
            
                        // Fetch managers
                        db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, managers) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
            
                            const employeeChoices = employees.map(employee => ({ name: employee.name, value: employee.id }));
                            const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
                            const managerChoices = managers.map(manager => ({ name: manager.name, value: manager.id }));
                            managerChoices.unshift({ name: 'None', value: null });
            
                            inquirer.prompt([
                                {
                                    type: "list",
                                    name: "employeeId",
                                    message: "Which employee do you want to update?",
                                    choices: employeeChoices
                                },
                                {
                                    type: "input",
                                    name: "firstName",
                                    message: "What is the updated first name of the employee?"
                                },
                                {
                                    type: "input",
                                    name: "lastName",
                                    message: "What is the updated last name of the employee?"
                                },
                                {
                                    type: 'list',
                                    name: 'roleId',
                                    message: 'What is the updated role of the employee?',  
                                    choices: roleChoices
                                },
                                {
                                    type: 'list',
                                    name: 'managerId',
                                    message: 'Who is the updated manager of the employee?',  
                                    choices: managerChoices
                                }
                            ])
                            .then(answers => {
                                db.query('UPDATE employee SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? WHERE id = ?', [answers.firstName, answers.lastName, answers.roleId, answers.salary, answers.managerId || null, answers.employeeId], (err, results) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    } else {
                                        console.log("Updated employee details")
                                        mainMenu();
                                    }
                                })
                            })
                        });
                    })
                });
                break;
            default:
                console.log("doesn't match any cases")
        }
    })
}  

// Delete a department
async function deleteDepartment() {
    try {
        const [departments] = await db.query("SELECT * FROM department");
        const departmentChoices = departments.map(dept => ({ name: dept.name, value: dept.id }));

        const { departmentId } = await inquirer.prompt([
            {
                type: "list",
                name: "departmentId",
                message: "Which department would you like to delete?",
                choices: departmentChoices
            }
        ]);

        const [roles] = await db.query("SELECT * FROM role WHERE department_id = ?", [departmentId]);

        if (roles.length > 0) {
            console.log("The department has associated roles.");
            console.table(roles);

            const { action } = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: "Would you like to delete all roles in this department or reassign them to another department?",
                    choices: ["Delete all roles", "Reassign roles"]
                }
            ]);

            if (action === "Delete all roles") {
                await db.query("DELETE FROM role WHERE department_id = ?", [departmentId]);
                console.log("All roles in the department have been deleted.");
            } else {
                const [otherDepartments] = await db.query("SELECT * FROM department WHERE id != ?", [departmentId]);
                const otherDepartmentChoices = otherDepartments.map(dept => ({ name: dept.name, value: dept.id }));

                for (let role of roles) {
                    const { newDepartmentId } = await inquirer.prompt([
                        {
                            type: "list",
                            name: "newDepartmentId",
                            message: `Select a new department for the role '${role.title}':`,
                            choices: otherDepartmentChoices
                        }
                    ]);

                    await db.query("UPDATE role SET department_id = ? WHERE id = ?", [newDepartmentId, role.id]);
                    console.log(`Role '${role.title}' reassigned to a new department.`);
                }
            }
        }

        await db.query("DELETE FROM department WHERE id = ?", [departmentId]);
        console.log("Department deleted successfully");
    } catch (err) {
        console.error(err);
    } finally {
        mainMenu();
    }
}

// delete a role
function deleteRole() {
    db.query("SELECT * FROM role", function(err, roles) {
        if (err) {
            console.log(err);
            return;
        }

        const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));

        inquirer.prompt([
            {
                type: "list",
                name: "roleId",
                message: "Which role would you like to delete?",
                choices: roleChoices
            }
        ]).then(answers => {
            db.query("DELETE FROM role WHERE id = ?", [answers.roleId], function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Role deleted successfully");
                    mainMenu();
                }
            })
        });
    });
}

// Delete an employee
function deleteEmployee() {
    db.query("SELECT * FROM employee", function(err, employees) {
        if (err) {
            console.log(err);
            return;
        }

        const employeeChoices = employees.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }));

        inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee would you like to delete?",
                choices: employeeChoices
            }
        ]).then(answers => {
            db.query("DELETE FROM employee WHERE id = ?", [answers.employeeId], function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Employee deleted successfully");
                    mainMenu();
                }
            })
        });
    });
};

// Calling function to start the application
mainMenu();