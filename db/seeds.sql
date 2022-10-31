INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Engineer", 150000, 1),
       ("Software Engineer", 120000, 1),
       ("Account Manager", 160000, 2),
       ("Accountant", 125000, 2),
       ("Legal Team Lead", 250000, 3),
       ("Lawyer", 190000, 3),
       ("Sales Lead", 100000, 4),
       ("Salesperson", 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Name1", "Last1", 1, null),
       ("Name2", "Last2", 2, 1),
       ("Name3", "Last3", 3, null),
       ("Name4", "Last4", 4, 3),
       ("Name5", "Last5", 5, null),
       ("Name6", "Last6", 6, 5),
       ("Name7", "Last7", 7, null),
       ("Name8", "Last8", 8, 7);