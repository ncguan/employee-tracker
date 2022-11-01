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
                    break;
                case 'add a department':
                    console.log("adding a department");
                    break;
                case 'add a role':
                    console.log("addding a role");
                    break;
                case 'add an employee':
                    console.log("adding an employee");
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

init();