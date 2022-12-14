const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const process = require('process');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'employees_db'
    },
);

const question = [
    {
        type: 'list',
        name: 'action',
        message: "What would you like to do?",
        choices: ["View All Employees", "Add an Employee", "Update an Employee's Role", "View All Roles", "Add a Role", "View All Departments", "Add a Department", "Exit"]
    },
];

const init = async () => {
    askQuestion();
}

function askQuestion() {
    let selected = "";
    inquirer
        .prompt(question)
        .then((answer) => {
            switch (answer.action) {
                case 'View All Departments':
                    viewDepartments();
                    break;
                case 'View All Roles':
                    viewRoles();
                    break;
                case "View All Employees":
                    viewEmployees();
                    break;
                case 'Add a Department':
                    addDepartment();
                    break;
                case 'Add a Role':
                    addRole();
                    break;
                case 'Add an Employee':
                    addEmployee();
                    break;
                case `Update an Employee's Role`:
                    updateEmployee();
                    break;
                case 'Exit':
                    selected = "Exit";
                    process.exit();
            }
        });
}

function viewDepartments() {
    db.promise().query("SELECT * FROM department ORDER BY department.id ASC")
        .then(([rows, fields]) => {
            console.table(rows);
            askQuestion();
        })
        .catch(console.log)
}

function viewRoles() {
    db.promise().query(`SELECT role.id, role.title, department.name AS department, role.salary
    FROM role 
    JOIN department ON department.id = role.department_id
    ORDER BY role.id ASC;`)
        .then(([rows, fields]) => {
            console.table(rows);
            askQuestion();
        })
        .catch(console.log)
}

function viewEmployees() {
    db.promise().query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, A.first_name AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee A ON A.id = employee.manager_id
    ORDER BY employee.id ASC;`)
        .then(([rows, fields]) => {
            console.table(rows);
            askQuestion();
        })
        .catch(console.log)
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'departmentAdd',
                message: "What is the name of the department?",
            },
        ])
        .then((answer) => {
            db.promise().query(`INSERT INTO department (name)
            VALUES ('${answer.departmentAdd}');`)
                .then(([rows, fields]) => {
                    console.log(`Added ${answer.departmentAdd} to the database`);
                    askQuestion();
                })
                .catch(console.log)
        });
}

function addRole() {
    const departmentNames = [];
    const departments = [];
    let departmentId;
    db.query('SELECT * FROM department', function (err, results) {
        for (let i = 0; i < results.length; i++) {
            departmentNames.push(results[i].name);
            departments.push(results[i]);
        }
    });

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'roleName',
                message: "What is the name of the role?",
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: "What is the salary of the role?",
            },
            {
                type: 'list',
                name: 'roleDepartment',
                message: "Which department does the role belong to?",
                choices: departmentNames
            },
        ])
        .then((answer) => {
            for (let i = 0; i < departments.length; i++) {
                if (answer.roleDepartment == departments[i].name) {
                    departmentId = departments[i].id;
                }
            }
            db.promise().query(`INSERT INTO role (title, salary, department_id)
            VALUES ('${answer.roleName}', '${answer.roleSalary}', '${departmentId}');`)
                .then(([rows, fields]) => {
                    console.log(`Added ${answer.roleName} to the database`);
                    askQuestion();
                })
                .catch(console.log)
        });
}

function addEmployee() {
    const roleNames = [];
    const roles = [];
    const employeeNames = ['None'];
    const employees = [];
    let roleId;
    let employeeId;
    db.query('SELECT * FROM role', function (err, results) {
        for (let i = 0; i < results.length; i++) {
            roleNames.push(results[i].title);
            roles.push(results[i]);
        }
    });
    db.query(`SELECT id, concat(first_name, ' ', last_name) AS employee_name FROM employee`, function (err, results) {
        for (let i = 0; i < results.length; i++) {
            employeeNames.push(results[i].employee_name);
            employees.push(results[i]);
        }
    });

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'employeeFirstName',
                message: "What is the employee's first name?",
            },
            {
                type: 'input',
                name: 'employeeLastName',
                message: "What is the employee's last name?",
            },
            {
                type: 'list',
                name: 'employeeRole',
                message: "What is the employee's role?",
                choices: roleNames
            },
            {
                type: 'list',
                name: 'employeeManager',
                message: "What is the employee's manager?",
                choices: employeeNames
            },
        ])
        .then((answer) => {
            for (let i = 0; i < roles.length; i++) {
                if (answer.employeeRole == roles[i].title) {
                    roleId = roles[i].id;
                }
            }
            for (let i = 0; i < employees.length; i++) {
                if (answer.employeeManager == employees[i].employee_name) {
                    employeeId = employees[i].id;
                }
                else {
                    employeeId = null;
                }
            }
            db.promise().query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', '${roleId}', ${employeeId});`)
                .then(([rows, fields]) => {
                    console.log(`Added ${answer.employeeFirstName} ${answer.employeeLastName} to the database`);
                    askQuestion();
                })
                .catch(console.log)
        });
}

function updateEmployee() {
    const roleNames = [];
    const roles = [];
    const employeeNames = [];
    const employees = [];
    let roleId;
    let employeeId;

    db.promise().query(`SELECT id, concat(first_name, ' ', last_name) AS employee_name FROM employee`)
        .then(([rows, fields]) => {
            for (let i = 0; i < rows.length; i++) {
                employeeNames.push(rows[i].employee_name);
                employees.push(rows[i]);
            }
            db.promise().query(`SELECT * FROM role`)
                .then(([rows, fields]) => {
                    for (let i = 0; i < rows.length; i++) {
                        roleNames.push(rows[i].title);
                        roles.push(rows[i]);
                    }
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'employeeName',
                                message: "Which employee's role do you want to update?",
                                choices: employeeNames
                            },
                            {
                                type: 'list',
                                name: 'updateRole',
                                message: "Which role do you want to assign the selected employee?",
                                choices: roleNames
                            },
                        ])
                        .then((answer) => {
                            for (let i = 0; i < employees.length; i++) {
                                if (answer.employeeName == employees[i].employee_name) {
                                    employeeId = employees[i].id;
                                }
                            }
                            for (let i = 0; i < roles.length; i++) {
                                if (answer.updateRole == roles[i].title) {
                                    roleId = roles[i].id;
                                }
                            }

                            db.promise().query(`UPDATE employee 
                            SET role_id = ${roleId}
                            WHERE id = ${employeeId};`)
                                .then(([rows, fields]) => {
                                    console.log(`Updated ${answer.employeeName}'s role`);
                                    askQuestion();
                                })
                                .catch(console.log)
                        });
                })
                .catch(console.log)
        })
        .catch(console.log)
}

init();