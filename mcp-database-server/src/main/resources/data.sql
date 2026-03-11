-- Insert departments
INSERT INTO departments (name, location) VALUES ('Engineering', 'New York');
INSERT INTO departments (name, location) VALUES ('Marketing', 'San Francisco');
INSERT INTO departments (name, location) VALUES ('Human Resources', 'Chicago');
INSERT INTO departments (name, location) VALUES ('Sales', 'London');

-- Insert employees
INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('John', 'Doe', 'john.doe@example.com', '2020-01-15', 1, 95000.00);

INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('Jane', 'Smith', 'jane.smith@example.com', '2019-03-22', 1, 105000.00);

INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('Mike', 'Johnson', 'mike.johnson@example.com', '2021-06-10', 2, 85000.00);

INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('Emily', 'Brown', 'emily.brown@example.com', '2022-02-01', 3, 75000.00);

INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('David', 'Wilson', 'david.wilson@example.com', '2018-11-30', 4, 110000.00);

INSERT INTO employees (first_name, last_name, email, hire_date, department_id, salary) 
VALUES ('Nishant', 'Chhattani', 'nishant.chhattani@iibm.com', '2026-03-10', 1, 100000.00);

-- Insert projects
INSERT INTO projects (name, start_date, end_date, budget) 
VALUES ('Project Alpha', '2023-01-01', '2023-12-31', 500000.00);

INSERT INTO projects (name, start_date, end_date, budget) 
VALUES ('Project Beta', '2023-06-15', '2024-06-14', 750000.00);

INSERT INTO projects (name, start_date, end_date, budget) 
VALUES ('Project Gamma', '2024-02-01', '2025-01-31', 1200000.00);

-- Assign employees to projects
INSERT INTO employee_projects (employee_id, project_id, role) 
VALUES (1, 1, 'Developer');

INSERT INTO employee_projects (employee_id, project_id, role) 
VALUES (2, 1, 'Tech Lead');

INSERT INTO employee_projects (employee_id, project_id, role) 
VALUES (2, 2, 'Project Manager');

INSERT INTO employee_projects (employee_id, project_id, role) 
VALUES (3, 2, 'Marketing Specialist');

INSERT INTO employee_projects (employee_id, project_id, role) 
VALUES (5, 3, 'Sales Director');
