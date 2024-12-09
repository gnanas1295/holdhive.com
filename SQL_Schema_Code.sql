--Roles Table
CREATE TABLE Roles (
    role_id INT IDENTITY(1001,1) PRIMARY KEY, 
    role_name VARCHAR(50) UNIQUE NOT NULL, -- E.g., "admin", "renter"
    description TEXT -- Optional: Description of role
);


--Users Table
CREATE TABLE Users (
    user_id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    profile_image_url TEXT,
    role_id INT NOT NULL, -- FK to Roles table
    address TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);


-- StorageSpaces Table
CREATE TABLE StorageSpaces (
    storage_id INT IDENTITY(10001,1) PRIMARY KEY, -- Auto increment for storage ID
    owner_id VARCHAR(255) NOT NULL, -- FK to Users.user_id
    title VARCHAR(150) NOT NULL,
    description TEXT,
    size DECIMAL(10, 2), -- Size in square meters
    location TEXT NOT NULL, -- Address or coordinates
    price_per_month DECIMAL(10, 2) NOT NULL,
    availability VARCHAR(20) CHECK (availability IN ('available', 'rented')) DEFAULT 'available',
    images_url NVARCHAR(MAX), -- Array of image URLs
    insurance_option BIT DEFAULT 0, -- 0 for false, 1 for true
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

--Rentals Table
CREATE TABLE Rentals (
    rental_id INT IDENTITY(101,1) PRIMARY KEY,
    storage_id INT NOT NULL, -- FK to StorageSpaces.storage_id
    renter_id VARCHAR(255) NOT NULL, -- FK to Users.user_id
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (storage_id) REFERENCES StorageSpaces(storage_id),
    FOREIGN KEY (renter_id) REFERENCES Users(user_id)
);

--Reviews Table
CREATE TABLE Reviews (
    review_id INT IDENTITY(10001,1) PRIMARY KEY,
    storage_id INT NOT NULL, -- FK to StorageSpaces.storage_id
    user_id VARCHAR(255) NOT NULL, -- FK to Users.user_id
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (storage_id) REFERENCES StorageSpaces(storage_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

--Payments Table
CREATE TABLE Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    rental_id INT NOT NULL, -- FK to Rentals.rental_id
    payment_method VARCHAR(50) CHECK (payment_method IN ('Stripe', 'PayPal', 'Bank Transfer')),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (rental_id) REFERENCES Rentals(rental_id)
);

--Audit logs Table
CREATE TABLE AuditLogs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- FK to Users.user_id
    action TEXT NOT NULL, -- e.g., "Created Listing"
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

--Featuers Table
CREATE TABLE Features (
    feature_id INT IDENTITY(10001,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- E.g., "Climate Control"
    description TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

--StorageSpaceFeatures Table
CREATE TABLE StorageSpaceFeatures (
    storage_id INT NOT NULL, -- FK to StorageSpaces.storage_id
    feature_id INT NOT NULL, -- FK to Features.feature_id
    PRIMARY KEY (storage_id, feature_id),
    FOREIGN KEY (storage_id) REFERENCES StorageSpaces(storage_id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES Features(feature_id) ON DELETE CASCADE
);


-- Insert Statements for Roles table
INSERT INTO Roles (role_name, description) VALUES 
('admin', 'Admin with full access to manage all data'),
('owner', 'User who owns the storage space'),
('renter', 'User who rents the storage space');

select * from Roles;

--Users Table
INSERT INTO Users (user_id, name, email, phone, profile_image_url, role_id, address, created_at, updated_at) VALUES
('user1', 'John Doe', 'john.doe@example.com', '123-456-7890', 'http://example.com/profile1.jpg', 1002, '123 Main St, Dublin', GETDATE(), GETDATE()),
('user2', 'Jane Smith', 'jane.smith@example.com', '098-765-4321', 'http://example.com/profile2.jpg', 1003, '456 Oak St, Cork', GETDATE(), GETDATE()),
('user3', 'Alice Brown', 'alice.brown@example.com', '123-321-4321', 'http://example.com/profile3.jpg', 1003, '789 Pine St, Galway', GETDATE(), GETDATE()),
('user4', 'Bob White', 'bob.white@example.com', '987-654-3210', 'http://example.com/profile4.jpg', 1001, '101 Maple St, Limerick', GETDATE(), GETDATE()),
('user5', 'Charlie Green', 'charlie.green@example.com', '654-987-3210', 'http://example.com/profile5.jpg', 1003, '202 Birch St, Kilkenny', GETDATE(), GETDATE());

select * from Users;


--Storage Table
INSERT INTO StorageSpaces (owner_id, title, description, size, location, price_per_month, availability, images_url, insurance_option, created_at, updated_at) VALUES
('user1', 'Spacious Garage in Dublin', 'A large garage with ample space for furniture or vehicles.', 25.0, '123 Main St, Dublin', 150.00, 'available', '["http://example.com/garage1.jpg"]', 1, GETDATE(), GETDATE()),
('user2', 'Small Basement in Cork', 'Perfect for storing seasonal items or small furniture.', 10.0, '456 Oak St, Cork', 80.00, 'available', '["http://example.com/basement1.jpg"]', 0, GETDATE(), GETDATE()),
('user3', 'Storage Room in Galway', 'Secure room in a private home, great for personal belongings.', 15.0, '789 Pine St, Galway', 100.00, 'rented', '["http://example.com/storage1.jpg"]', 1, GETDATE(), GETDATE()),
('user4', 'Office Space in Limerick', 'Ideal for businesses needing extra storage for documents.', 30.0, '101 Maple St, Limerick', 250.00, 'available', '["http://example.com/office1.jpg"]', 0, GETDATE(), GETDATE()),
('user5', 'Large Shed in Kilkenny', 'Outdoor storage with enough space for gardening equipment and tools.', 20.0, '202 Birch St, Kilkenny', 120.00, 'available', '["http://example.com/shed1.jpg"]', 0, GETDATE(), GETDATE());

select * from storagespaces;

--Rentals Table
INSERT INTO Rentals (storage_id, renter_id, start_date, end_date, total_price, payment_status, created_at, updated_at) VALUES
(10001, 'user2', '2024-12-01', '2025-12-01', 1500.00, 'paid', GETDATE(), GETDATE()),
(10002, 'user3', '2024-11-01', '2025-05-01', 480.00, 'paid', GETDATE(), GETDATE()),
(10003, 'user4', '2024-10-01', '2025-04-01', 800.00, 'pending', GETDATE(), GETDATE()),
(10004, 'user5', '2024-11-15', '2025-05-15', 1800.00, 'paid', GETDATE(), GETDATE()),
(10005, 'user1', '2024-10-10', '2025-10-10', 1200.00, 'failed', GETDATE(), GETDATE());

select * from rentals;

--Reviews Table
INSERT INTO Reviews (storage_id, user_id, rating, comment, created_at) VALUES
(10001, 'user3', 5, 'Great space! Perfect for storing my car and furniture.', GETDATE()),
(10002, 'user4', 4, 'Small but very convenient. Would rent again for short-term storage.', GETDATE()),
(10003, 'user5', 3, 'Good location, but the space is a bit small for what I need.', GETDATE()),
(10004, 'user1', 5, 'Exactly what I needed for my business. Spacious and secure.', GETDATE()),
(10005, 'user2', 4, 'The shed is great for outdoor storage. No complaints!', GETDATE());

select * from reviews;

--Payments Table
INSERT INTO Payments (rental_id, payment_method, amount, status, created_at, updated_at) VALUES
(101, 'Stripe', 1500.00, 'completed', GETDATE(), GETDATE()),
(102, 'PayPal', 480.00, 'completed', GETDATE(), GETDATE()),
(103, 'Bank Transfer', 800.00, 'pending', GETDATE(), GETDATE()),
(104, 'Stripe', 1800.00, 'completed', GETDATE(), GETDATE()),
(105, 'PayPal', 1200.00, 'failed', GETDATE(), GETDATE());

select * from Payments;

--AudioLogs Table
INSERT INTO AuditLogs (user_id, action, timestamp) VALUES
('user1', 'Created a new storage listing: Spacious Garage in Dublin', GETDATE()),
('user2', 'Updated listing: Small Basement in Cork', GETDATE()),
('user3', 'Deleted rental: Storage Room in Galway', GETDATE()),
('user4', 'Added payment for rental: Office Space in Limerick', GETDATE()),
('user5', 'Reviewed storage space: Large Shed in Kilkenny', GETDATE());

select * from Auditlogs;

--Features Table
INSERT INTO Features (name, description, created_at, updated_at) VALUES
('Climate Control', 'The space is climate-controlled to protect sensitive items.', GETDATE(), GETDATE()),
('24/7 Surveillance', 'The storage space is monitored 24/7 with security cameras.', GETDATE(), GETDATE()),
('Easy Parking', 'There is plenty of space for easy parking right next to the unit.', GETDATE(), GETDATE()),
('Insured', 'Insurance is included in the rental price for extra peace of mind.', GETDATE(), GETDATE()),
('Elevator Access', 'The unit is accessible via an elevator for easy loading and unloading.', GETDATE(), GETDATE());


select * from Features;

--StorageSpaceFeatures
INSERT INTO StorageSpaceFeatures (storage_id, feature_id) VALUES
(10001, 10001), -- Spacious Garage in Dublin has Climate Control
(10001, 10002), -- Spacious Garage in Dublin has 24/7 Surveillance
(10002, 10003) -- Small Basement in

select * from StorageSpaceFeatures;
