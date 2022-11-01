const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
);

const question = [
    {
        type: 'list',
        name: 'action',
        message: "What would you like to do?",
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "Quit"]
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
                case 'view all departments':
                    console.log("viewing departments");
                    viewDepartments();
                    break;
                case 'view all roles':
                    console.log("viewing roles");
                    viewRoles();
                    break;
                case "view all employees":
                    console.log("viewing all employees");
                    viewEmployees();
                    break;
                case 'add a department':
                    console.log("adding a department");
                    addDepartment();
                    break;
                case 'add a role':
                    console.log("addding a role");
                    addRole();
                    break;
                case 'add an employee':
                    console.log("adding an employee");
                    addEmployee();
                    break;
                case 'update an employee role':
                    console.log("updating an empoyee role");
                    break;
                case 'Quit':
                    console.log("quitting");
                    selected = "Quit";
                    break;
            }
        });
}

function viewDepartments() {
    db.promise().query("SELECT * FROM department")
        .then(([rows, fields]) => {
            console.table(rows);
            askQuestion();
        })
        .catch(console.log)
}

function viewRoles() {
    db.promise().query(`SELECT role.id, role.title, department.name AS department, role.salary
    FROM role 
    JOIN department ON department.id = role.department_id;`)
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
    LEFT JOIN employee A ON A.id = employee.manager_id;`)
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
                message: "What is the name of the role?",
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
                else{
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

init();