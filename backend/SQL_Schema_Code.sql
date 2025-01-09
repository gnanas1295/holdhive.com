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
	eircode VARCHAR(20),
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
	storage_type VARCHAR(30),
    size DECIMAL(10, 2), -- Size in square meters
    location TEXT NOT NULL, -- Address or coordinates
	eircode VARCHAR(20),
    price_per_month DECIMAL(10, 2) NOT NULL,
    availability VARCHAR(20) CHECK (availability IN ('available', 'rented')) DEFAULT 'available',
    images_url NVARCHAR(MAX), -- Array of image URLs
    insurance_option BIT DEFAULT 0, -- 0 for false, 1 for true
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);


ALTER TABLE StorageSpaces
ADD eircode VARCHAR(20), -- Add a column for eircode
    storage_type VARCHAR(30); -- Add a column for storage type



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
('renter', 'User who rents the storage space'),
('user', 'User with access to Rent and Owns the place');

select * from Roles;

--Users Table
INSERT INTO Users (user_id, name, email, phone, profile_image_url, role_id, address, eircode, created_at, updated_at) VALUES
('user1', 'John Doe', 'john.doe@example.com', '123-456-7890', 'http://example.com/profile1.jpg', 1002, '123 Main St, Dublin', ‘D01F1P2’, GETDATE(), GETDATE()),
('user2', 'Jane Smith', 'jane.smith@example.com', '098-765-4321', 'http://example.com/profile2.jpg', 1003, '456 Oak St, Cork', ‘D01F1P2’, GETDATE(), GETDATE()),
('user3', 'Alice Brown', 'alice.brown@example.com', '123-321-4321', 'http://example.com/profile3.jpg', 1003, '789 Pine St, Galway', ‘D01F1P2’, GETDATE(), GETDATE()),
('user4', 'Bob White', 'bob.white@example.com', '987-654-3210', 'http://example.com/profile4.jpg', 1001, '101 Maple St, Limerick', ‘D01F1P2’, GETDATE(), GETDATE()),
('user5', 'Charlie Green', 'charlie.green@example.com', '654-987-3210', 'http://example.com/profile5.jpg', 1003, '202 Birch St, Kilkenny',‘D01F1P2’,  GETDATE(), GETDATE());

select * from Users;

UPDATE Users SET role_id = 1001 WHERE user_id = 'r3u1PjtEUcXfkHYs8p6ITHUN7wn2';

UPDATE users SET profile_image_url = 'https://holdhive.s3.eu-west-1.amazonaws.com/Avator/Profile_Image_Women_4.png' where user_id = 'user5';

Delete from Users where name = 'Mrudula Didde';

--Storage Table
INSERT INTO StorageSpaces (owner_id, title, description, size, location, price_per_month, availability, images_url, insurance_option, created_at, updated_at) VALUES
('user1', 'Spacious Garage in Dublin', 'A large garage with ample space for furniture or vehicles.', 25.0, '123 Main St, Dublin', 150.00, 'available', '["http://example.com/garage1.jpg"]', 1, GETDATE(), GETDATE()),
('user2', 'Small Basement in Cork', 'Perfect for storing seasonal items or small furniture.', 10.0, '456 Oak St, Cork', 80.00, 'available', '["http://example.com/basement1.jpg"]', 0, GETDATE(), GETDATE()),
('user3', 'Storage Room in Galway', 'Secure room in a private home, great for personal belongings.', 15.0, '789 Pine St, Galway', 100.00, 'rented', '["http://example.com/storage1.jpg"]', 1, GETDATE(), GETDATE()),
('user4', 'Office Space in Limerick', 'Ideal for businesses needing extra storage for documents.', 30.0, '101 Maple St, Limerick', 250.00, 'available', '["http://example.com/office1.jpg"]', 0, GETDATE(), GETDATE()),
('user5', 'Large Shed in Kilkenny', 'Outdoor storage with enough space for gardening equipment and tools.', 20.0, '202 Birch St, Kilkenny', 120.00, 'available', '["http://example.com/shed1.jpg"]', 0, GETDATE(), GETDATE());

select * from storagespaces;

UPDATE StorageSpaces SET images_url = 'https://holdhive.s3.eu-west-1.amazonaws.com/Storage_Spaces_Images/Empty_Roof.jpg' where storage_id = '10041';

SELECT 
    s.storage_id,
    s.owner_id,
    s.title,
    s.description,
    s.size,
    s.location,
    s.price_per_month,
    s.availability,
    s.images_url,
    s.insurance_option,
    s.eircode,
    s.storage_type,
    s.created_at,
    s.updated_at,
    COALESCE(r.average_review_score, 0) AS average_review_score,
    COALESCE(r.review_ids, '[]') AS review_ids
FROM 
    StorageSpaces s
LEFT JOIN 
    (
        SELECT 
            storage_id,
            AVG(rating) AS average_review_score,
            STRING_AGG(CAST(review_id AS VARCHAR), ',') AS review_ids
        FROM 
            Reviews
        GROUP BY 
            storage_id
    ) r ON s.storage_id = r.storage_id
WHERE 
    s.storage_id = '10005';



Update storagespaces SET eircode = 'D02 X285' where storage_id = '10001';
Update storagespaces SET eircode = 'T12 A8RP' where storage_id = '10002';
Update storagespaces SET eircode = 'V94 FKT9' where storage_id = '10003';
Update storagespaces SET eircode = 'H91 A4CC' where storage_id = '10004';
Update storagespaces SET eircode = 'X91 YK0F' where storage_id = '10005';

--Rentals Table
INSERT INTO Rentals (storage_id, renter_id, start_date, end_date, total_price, payment_status, created_at, updated_at) VALUES
(10001, 'user2', '2024-12-01', '2025-12-01', 1500.00, 'paid', GETDATE(), GETDATE()),
(10002, 'user3', '2024-11-01', '2025-05-01', 480.00, 'paid', GETDATE(), GETDATE()),
(10003, 'user4', '2024-10-01', '2025-04-01', 800.00, 'pending', GETDATE(), GETDATE()),
(10004, 'user5', '2024-11-15', '2025-05-15', 1800.00, 'paid', GETDATE(), GETDATE()),
(10005, 'user1', '2024-10-10', '2025-10-10', 1200.00, 'failed', GETDATE(), GETDATE());

select * from rentals;

SELECT 
            s.storage_id, 
            s.owner_id, 
            s.title, 
            s.description, 
            s.size, 
            s.location, 
            s.price_per_month, 
            s.availability, 
            s.images_url, 
            s.insurance_option, 
            s.eircode, 
            s.storage_type, 
            s.created_at, 
            s.updated_at,
            u.name AS owner_name, 
            u.email AS owner_email, 
            u.phone AS owner_phone,
            COALESCE(r.average_review_score, 0) AS average_review_score,
            COALESCE(r.review_ids, '[]') AS review_ids
        FROM 
            StorageSpaces s
        JOIN 
            Users u ON s.owner_id = u.user_id
        LEFT JOIN 
            (
                SELECT 
                    storage_id,
                    AVG(rating) AS average_review_score,
                    STRING_AGG(CAST(review_id AS VARCHAR), ',') AS review_ids
                FROM 
                    Reviews
                GROUP BY 
                    storage_id
            ) r ON s.storage_id = r.storage_id
        WHERE 
            s.owner_id = 'user4';



--Reviews Table
INSERT INTO Reviews (storage_id, user_id, rating, comment, created_at) VALUES
(10001, 'user3', 5, 'Great space! Perfect for storing my car and furniture.', GETDATE()),
(10002, 'user4', 4, 'Small but very convenient. Would rent again for short-term storage.', GETDATE()),
(10003, 'user5', 3, 'Good location, but the space is a bit small for what I need.', GETDATE()),
(10004, 'user1', 5, 'Exactly what I needed for my business. Spacious and secure.', GETDATE()),
(10005, 'user2', 4, 'The shed is great for outdoor storage. No complaints!', GETDATE());

select * from reviews;


 -- List reviews by User-ID:
SELECT 
                    r.review_id,
                    r.storage_id,
                    r.rating,
                    r.comment,
                    r.created_at AS review_created_at,
                    s.title AS storage_title,
                    s.description AS storage_description,
                    s.location AS storage_location,
                    s.price_per_month AS storage_price,
                    u.name AS owner_name,
                    u.email AS owner_email,
                    u.phone AS owner_phone,
                    rentals.rental_id
                FROM 
                    Reviews r
                LEFT JOIN 
                    StorageSpaces s ON r.storage_id = s.storage_id
                LEFT JOIN 
                    Users u ON s.owner_id = u.user_id
                LEFT JOIN 
                    Rentals rentals ON r.storage_id = rentals.storage_id AND rentals.renter_id = 'mtrrg0m6m1cCZx52DEvjysEwMyB3'
                WHERE 
                    r.user_id = 'mtrrg0m6m1cCZx52DEvjysEwMyB3';


WITH ReviewDetails AS (
    SELECT 
        r.review_id,
        r.storage_id,
        r.rating,
        r.comment,
        r.created_at AS review_created_at
    FROM 
        Reviews r
    WHERE 
        r.user_id = 'r3u1PjtEUcXfkHYs8p6ITHUN7wn2'
),
StorageDetails AS (
    SELECT 
        s.storage_id,
        s.title AS storage_title,
        s.location AS storage_location,
        s.price_per_month AS storage_price,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone
    FROM 
        StorageSpaces s
    JOIN 
        Users u ON s.owner_id = u.user_id
),
RentalDetails AS (
    SELECT 
        rentals.storage_id,
        MAX(rentals.rental_id) AS rental_id
    FROM 
        Rentals rentals
    WHERE 
        rentals.renter_id = 'r3u1PjtEUcXfkHYs8p6ITHUN7wn2'
    GROUP BY 
        rentals.storage_id
)
SELECT 
    rd.review_id,
    rd.storage_id,
    rd.rating,
    rd.comment,
    rd.review_created_at,
    sd.storage_title,
    sd.storage_location,
    sd.storage_price,
    sd.owner_name,
    sd.owner_email,
    sd.owner_phone,
    COALESCE(rd.rating, 0) AS average_review_score,
    COALESCE(rd.review_id, '') AS review_ids,
    rd.comment
FROM 
    ReviewDetails rd
LEFT JOIN 
    StorageDetails sd ON rd.storage_id = sd.storage_id
LEFT JOIN 
    RentalDetails rt ON rd.storage_id = rt.storage_id;





--List reviews by the owner id or user owner of:
WITH AvgRatings AS (
                    SELECT 
                        storage_id,
                        AVG(rating) AS average_rating
                    FROM Reviews
                    GROUP BY storage_id
                ),
                RankedReviews AS (
                    SELECT 
                        r.review_id, r.rating, r.comment, r.created_at, 
                        r.user_id AS reviewer_id, u_reviewer.name AS reviewer_name, u_reviewer.email AS reviewer_email, 
                        CAST(u_reviewer.profile_image_url AS NVARCHAR(MAX)) AS reviewer_profile_image,
                        s.storage_id, s.owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email,
                        s.title AS storage_title, CAST(s.description AS NVARCHAR(MAX)) AS storage_description,
                        s.price_per_month as storage_price,s.location as storage_location, ar.average_rating,
                        ROW_NUMBER() OVER (PARTITION BY r.review_id ORDER BY r.created_at DESC) AS row_num
                    FROM Reviews r
                    JOIN StorageSpaces s ON r.storage_id = s.storage_id
                    JOIN Users u_reviewer ON r.user_id = u_reviewer.user_id
                    JOIN Users u_owner ON s.owner_id = u_owner.user_id
                    LEFT JOIN AvgRatings ar ON r.storage_id = ar.storage_id
                    WHERE s.owner_id = 'mtrrg0m6m1cCZx52DEvjysEwMyB3'
                )
                SELECT * 
                FROM RankedReviews
                WHERE row_num = 1;
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
