require('dotenv').config();
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const ctable = require("console.table");


const db = mysql2.createConnection({
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "employeetrackerdb",
    host: "127.0.0.1",
    port: 3306
})

function mainMenu() {
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
                ]
    
            }
    
        ]
    )
    .then(answers => {
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
                            type: "input",
                            name: "salary",
                            message: "What is the salary for the new role?"
                        },
                        {
                            type: "list",
                            name: "manager",
                            message: "Who is the employees manager?",
                            choices: [managerChoices, "None"]
                        },
                    ]).then(answers => {
                        // Correct the INSERT query to add an employee
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, answers.role, answers.manager === null ? null : answers.manager], function(err, data) {
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
            default:
                console.log("doesn't match any cases")
        }
    })
}

mainMenu()