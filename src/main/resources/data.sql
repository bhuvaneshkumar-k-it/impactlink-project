-- Clean Slate
DELETE FROM project_sdg;
DELETE FROM project;

-- 1. OCEAN PROJECT (Matches "Coastal", "Fish", "Tsunami")
INSERT INTO project (id, beneficiary_target, description, latitude, longitude, name) VALUES 
(101, 'Fishermen', 'Tsunami and Cyclone Alerts for coastal safety', 13.0835, 80.2715, 'Ocean Safety NGO');

-- 2. EDUCATION PROJECT (Matches "Girls", "Women", "School")
INSERT INTO project (id, beneficiary_target, description, latitude, longitude, name) VALUES 
(102, 'Women and Girls', 'Vocational training and safe housing hostel', 13.0850, 80.2700, 'Women Power Foundation');

-- 3. HEALTH PROJECT (Matches "Clinic", "Doctor")
INSERT INTO project (id, beneficiary_target, description, latitude, longitude, name) VALUES 
(103, 'Urban Poor', 'Mobile health clinic for slum areas', 13.0810, 80.2720, 'Chennai City Health');

-- 4. DISABILITY PROJECT (Matches "Handicapped", "Disabled", "Garment")
INSERT INTO project (id, beneficiary_target, description, latitude, longitude, name) VALUES 
(104, 'Disabled Youth', 'Vocational training looms for handicapped youth', 13.0840, 80.2710, 'Chennai Ability Center');

-- Map SDGs
INSERT INTO project_sdg (project_id, sdg_code) VALUES
(101, '13.1'), (102, '5.1'), (103, '3.8'), (104, '8.5');
