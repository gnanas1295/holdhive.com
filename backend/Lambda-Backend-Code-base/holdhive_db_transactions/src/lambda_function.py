from db_client import execute_query
from utils import format_response
from datetime import datetime

import json

def lambda_handler(event, context):
    """
    Main entry point for handling database transactions.
    Routes requests to the appropriate database operations.
    """
    try:
        print(f"Event: {event}")
        # event = json.loads(event)
        # Extract the action and data from the event
        action = event.get("action", None)
        data = event.get("data", {})

        # Storage API
        if action == "list_all_storage_locations":
            # Fetch all available storage locations -> Working as expected
            # query = "SELECT * FROM StorageSpaces WHERE availability = 'available';"
            query = "SELECT * FROM StorageSpaces WHERE availability = ?;"
            params = ('available',)
            result = execute_query(query, params)
            print(f"Result: {result}")
            return format_response(200, result)

        elif action == "check_available_storage":
            # Fetch available storage locations based on the given date range
            start_date = data.get("start_date")
            end_date = data.get("end_date")

            if not start_date or not end_date:
                return {"statusCode": 400, "body": {"error": "start_date and end_date are required"}}

            query = """
                SELECT s.*
                FROM StorageSpaces s
                WHERE s.availability = 'available'
                AND NOT EXISTS (
                    SELECT 1
                    FROM Rentals r
                    WHERE r.storage_id = s.storage_id
                        AND (
                            (r.start_date < ? AND r.end_date > ?) -- Rentals that overlap at the start
                            OR
                            (r.start_date <= ? AND r.end_date >= ?) -- Rentals entirely within the query range
                            OR
                            (r.start_date >= ? AND r.start_date <= ?) -- Rentals that overlap at the end
                        )
                );
            """
            params = (end_date,start_date,end_date,start_date,start_date,end_date)
            results = execute_query(query, params)
            return {"statusCode": 200, "body": results}

        elif action == "fetch_storage_by_id":
            # Fetch a specific storage location by ID
            query = "SELECT * FROM StorageSpaces WHERE storage_id = ?;"
            params = (data.get("storage_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}
        
        elif action == "fetch_storage_by_owner_id":
            # Fetch all the storage location of the owner based upon his user_id
            owner_id = data.get("owner_id")
            if not owner_id:
                return {"statusCode": 400, "body": {"error": "owner_id is required"}}

            query = """
                SELECT 
                    s.storage_id, s.owner_id, s.title, s.description, s.size, 
                    s.location, s.price_per_month, s.availability, s.images_url, 
                    s.insurance_option, s.eircode, s.storage_type, 
                    s.created_at, s.updated_at,
                    u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
                FROM StorageSpaces s
                JOIN Users u ON s.owner_id = u.user_id
                WHERE s.owner_id = ?;
            """
            params = (owner_id,)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}

        elif action == "add_storage_location":
            query = """
                INSERT INTO StorageSpaces (owner_id, title, description, storage_type, size, location, eircode, price_per_month, availability, images_url, insurance_option, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                data.get("user_id"),
                data.get("title"),
                data.get("description"),
                data.get("storage_type"),
                data.get("size"),
                data.get("location"),
                data.get("eircode"),
                data.get("price_per_month"),
                "available",
                data.get("images_url"),
                data.get("insurance_option", 0),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            )
            execute_query(query, params, commit=True)
            return {"statusCode": 200, "body": {"message": "Storage location added"}}
        
        elif action == "delete_storage_location":
            storage_id = data.get("storage_id")
            
            # Check for current or future rentals
            rental_check_query = """
                SELECT COUNT(*) AS rental_count
                FROM Rentals
                WHERE storage_id = ? AND end_date >= GETDATE();
            """
            rental_check_params = (storage_id,)
            rental_count_result = execute_query(rental_check_query, rental_check_params)

            # Extract rental count
            rental_count = rental_count_result[0]["rental_count"] if rental_count_result else 0

            if rental_count > 0:
                # Rentals exist, block deletion
                return {
                    "statusCode": 400,
                    "body": {"error": "Cannot delete storage space. Active or future rentals are present."}
                }

            # Proceed to delete storage space if no rentals
            delete_query = "DELETE FROM StorageSpaces WHERE storage_id = ?;"
            delete_params = (storage_id,)
            execute_query(delete_query, delete_params, commit=True)

            return {
                "statusCode": 200,
                "body": {"message": "Storage location deleted successfully."}
            }

        elif action == "update_storage_location":
            update_fields = ", ".join([f"{key} = ?" for key in data["update_data"].keys()])
            query = f"UPDATE StorageSpaces SET {update_fields}, updated_at = GETDATE() WHERE storage_id = ?"
            params = list(data["update_data"].values()) + [data.get("storage_id")]
            execute_query(query, params, commit=True)
            return {"statusCode": 200, "body": {"message": "Storage location updated"}}

        elif action == "check_storage_availability":
            storage_id = data.get("storage_id")
            start_date = data.get("start_date")
            end_date = data.get("end_date")

            if not storage_id or not start_date or not end_date:
                return {"statusCode": 400, "body": {"error": "storage_id, start_date, and end_date are required"}}

            query = """
                SELECT COUNT(*) AS count
                FROM Rentals
                WHERE storage_id = ?
                AND (
                    (start_date < ? AND end_date > ?)
                    OR
                    (start_date <= ? AND end_date >= ?)
                    OR
                    (start_date >= ? AND start_date <= ?)
                )
            """
            params = (storage_id, end_date, start_date, end_date, start_date, start_date, end_date)
            result = execute_query(query, params)
            available = result[0]["count"] == 0

            return {"statusCode": 200, "body": {"available": available}}

        elif action == "get_storage_price":
            storage_id = data.get("storage_id")

            if not storage_id:
                return {"statusCode": 400, "body": {"error": "storage_id is required"}}

            query = """
                SELECT price_per_month
                FROM StorageSpaces
                WHERE storage_id = ?
            """
            params = (storage_id,)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result[0] if result else {}}

        #Profile API
        elif action == "create_account":
            #Creation of the new Account details addition in the DB
            user_id = data.get("user_id")
            email = data.get("email")
            role_name = data.get("role_name")
            if isinstance(role_name, tuple):
                role_name = role_name[0]
            role_id = 1001 if role_name == "admin" else 1004 
            print(f"RoleName = {role_name}, Role_Id: {role_id}")
            # query = (
            #     f"INSERT INTO Users (user_id, email, role_id, created_at, updated_at) "
            #     f"VALUES ('{user_id}', '{email}', '{role_id}', '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}', '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}');"
            # )
            query = "INSERT INTO Users (user_id, email, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
            params = (user_id, email, role_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            execute_query(query, params, commit=True)
            return format_response(200, {"message": "User created successfully in the DB"})

        elif action == "update_profile":
            #Updation of the Profile
            user_id = data.get("user_id")
            fields = data.get("profile_data", {})
            email = fields.get("email")
            name = fields.get("name")
            phone = fields.get("phone")
            image_url = fields.get("profile_image_url")
            role_name = fields.get("role_name")
            if isinstance(role_name, tuple):
                role_name = role_name[0]
            role_id = 1001 if role_name=="admin" else 1004
            address = fields.get("address")
            eircode = fields.get("eircode")
            updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            # query = (
            #     f"UPDATE Users "
            #     f"SET name = '{name}', phone = '{phone}', profile_image_url = '{image_url}', role_id = '{role_id}', address = '{address}', eircode = '{eircode}', updated_at = '{updated_at}'"
            #     f"WHERE user_id = '{user_id}'"
            # )

            # Query with parameterized placeholders
            query = """
                UPDATE Users
                SET name = ?, phone = ?, profile_image_url = ?, role_id = ?, address = ?, eircode = ?, updated_at = ?
                WHERE user_id = ?
            """
            params = (name, phone, image_url, role_id, address, eircode, updated_at, user_id)
            execute_query(query, params, commit=True)
            # execute_query(query, commit=True)
            return format_response(200, {"message": "User Profile Updated Successfully"})

        elif action == "get_user_profile":
            query = """
                SELECT 
                    u.user_id, u.name, u.email, u.phone, u.profile_image_url, 
                    u.address, u.eircode, u.created_at, u.updated_at,
                    r.role_name
                FROM Users u
                JOIN Roles r ON u.role_id = r.role_id
                WHERE u.user_id = ?;
            """
            params = (data.get("user_id"),)
            result = execute_query(query, params)
            if result:
                return {"statusCode": 200, "body": result[0]}  # Return the first result as a dictionary
            return {"statusCode": 404, "body": {"error": "User not found"}}

        elif action == "list_all_users":
            query = """
                SELECT 
                    u.user_id, u.name, u.email, u.phone, u.profile_image_url, 
                    u.address, u.eircode, u.created_at, u.updated_at,
                    r.role_name
                FROM Users u
                JOIN Roles r ON u.role_id = r.role_id;
            """
            result = execute_query(query)
            return {"statusCode": 200, "body": result}

        elif action == "update_user_role":
            #Updation of the Profile
            user_email_id = data.get("email_id")
            query = """
                UPDATE Users
                SET role_id = (SELECT role_id FROM Roles WHERE role_name = 'admin')
                WHERE email = ?
            """
            params = (user_email_id)
            execute_query(query, params, commit=True)
            # execute_query(query, commit=True)
            return format_response(200, {"message": "User Profile Updated to Admin Successfully"})

        elif action == "remove_user":
            # Deletion of the user and related data
            user_id = data.get("user_id")
            if not user_id:
                return {"statusCode": 400, "body": {"error": "user_id is required"}}

            # Step 1: Check rentals as a renter
            check_renter_query = """
                SELECT COUNT(*)
                FROM Rentals
                WHERE renter_id = ? AND end_date >= GETDATE();
            """
            renter_count = execute_query(check_renter_query, user_id)
            if renter_count[0][""] > 0:
                return format_response(400, {"error": "Cannot delete user due to active or future rentals as a renter"})

            # Step 2: Check rentals for owned storage
            check_owner_query = """
                SELECT COUNT(*)
                FROM Rentals r
                JOIN StorageSpaces s ON r.storage_id = s.storage_id
                WHERE s.owner_id = ? AND r.end_date >= GETDATE();
            """
            owner_count = execute_query(check_owner_query, user_id)
            if owner_count[0][""] > 0:
                return format_response(400, {"error": "Cannot delete user due to active or future rentals for owned storage spaces"})

            # Step 3: Delete reviews made by the user
            delete_user_reviews_query = """
                DELETE FROM Reviews WHERE user_id = ?;
            """
            execute_query(delete_user_reviews_query, user_id, commit=True)

            # Step 4: Delete reviews for user-owned storage spaces
            delete_storage_reviews_query = """
                DELETE r
                FROM Reviews r
                JOIN StorageSpaces s ON r.storage_id = s.storage_id
                WHERE s.owner_id = ?;
            """
            execute_query(delete_storage_reviews_query, user_id, commit=True)

            # Step 5: Delete rentals where the user is a renter
            delete_renter_rentals_query = """
                DELETE FROM Rentals WHERE renter_id = ?;
            """
            execute_query(delete_renter_rentals_query, user_id, commit=True)

            # Step 6: Delete rentals for owned storage
            delete_owner_rentals_query = """
                DELETE r
                FROM Rentals r
                JOIN StorageSpaces s ON r.storage_id = s.storage_id
                WHERE s.owner_id = ?;
            """
            execute_query(delete_owner_rentals_query, user_id, commit=True)

            # Step 7: Delete storage spaces owned by the user
            delete_storage_query = """
                DELETE FROM StorageSpaces WHERE owner_id = ?;
            """
            execute_query(delete_storage_query, user_id, commit=True)

            # Step 8: Delete the user from the Users table
            delete_user_query = """
                DELETE FROM Users WHERE user_id = ?;
            """
            execute_query(delete_user_query, user_id, commit=True)

            return format_response(200, {"message": "User and related data deleted successfully"})


        #Rental Service API

        # List all rentals
        if action == "list_all_rentals":
            query = """
                        SELECT 
                            r.rental_id, r.start_date, r.end_date, r.total_price, r.payment_status, 
                            u_renter.user_id AS renter_id, u_renter.name AS renter_name, u_renter.email AS renter_email, u_renter.phone AS renter_phone,
                            u_owner.user_id AS owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email, u_owner.phone AS owner_phone,
                            s.storage_id, s.title AS storage_title, s.description AS storage_description, s.size AS storage_size, 
                            s.location AS storage_location, s.price_per_month, s.insurance_option, s.eircode, s.storage_type
                        FROM Rentals r
                        JOIN StorageSpaces s ON r.storage_id = s.storage_id
                        JOIN Users u_renter ON r.renter_id = u_renter.user_id
                        JOIN Users u_owner ON s.owner_id = u_owner.user_id;
                    """
            result = execute_query(query)
            return format_response(200, result)

        # List rental by rental_id
        elif action == "list_rental_by_id":
            query = """
                        SELECT 
                            r.rental_id, r.start_date, r.end_date, r.total_price, r.payment_status, 
                            u_renter.user_id AS renter_id, u_renter.name AS renter_name, u_renter.email AS renter_email, u_renter.phone AS renter_phone,
                            u_owner.user_id AS owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email, u_owner.phone AS owner_phone,
                            s.storage_id, s.title AS storage_title, s.description AS storage_description, s.size AS storage_size, 
                            s.location AS storage_location, s.price_per_month, s.insurance_option, s.eircode, s.storage_type
                        FROM Rentals r
                        JOIN StorageSpaces s ON r.storage_id = s.storage_id
                        JOIN Users u_renter ON r.renter_id = u_renter.user_id
                        JOIN Users u_owner ON s.owner_id = u_owner.user_id
                        WHERE r.rental_id = ?;
                    """
            params = (data.get("rental_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}

        # List rentals by storage_id
        elif action == "list_rentals_by_storage_id":
            query = """
                        SELECT 
                            r.rental_id, r.start_date, r.end_date, r.total_price, r.payment_status, 
                            u_renter.user_id AS renter_id, u_renter.name AS renter_name, u_renter.email AS renter_email, u_renter.phone AS renter_phone,
                            u_owner.user_id AS owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email, u_owner.phone AS owner_phone,
                            s.storage_id, s.title AS storage_title, s.description AS storage_description, s.size AS storage_size, 
                            s.location AS storage_location, s.price_per_month, s.insurance_option, s.eircode, s.storage_type
                        FROM Rentals r
                        JOIN StorageSpaces s ON r.storage_id = s.storage_id
                        JOIN Users u_renter ON r.renter_id = u_renter.user_id
                        JOIN Users u_owner ON s.owner_id = u_owner.user_id
                        WHERE r.storage_id = ?;
                    """
            params = (data.get("storage_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}

        # List rentals by renter_id
        elif action == "list_rentals_by_renter_id":
            query = """
                        SELECT 
                            r.rental_id, r.start_date, r.end_date, r.total_price, r.payment_status, 
                            u_renter.user_id AS renter_id, u_renter.name AS renter_name, u_renter.email AS renter_email, u_renter.phone AS renter_phone,
                            u_owner.user_id AS owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email, u_owner.phone AS owner_phone,
                            s.storage_id, s.title AS storage_title, s.description AS storage_description, s.size AS storage_size, 
                            s.location AS storage_location, s.price_per_month, s.insurance_option, s.eircode, s.storage_type
                        FROM Rentals r
                        JOIN StorageSpaces s ON r.storage_id = s.storage_id
                        JOIN Users u_renter ON r.renter_id = u_renter.user_id
                        JOIN Users u_owner ON s.owner_id = u_owner.user_id
                        WHERE r.renter_id = ?;
                    """
            params = (data.get("renter_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}

        # List rentals by owner_id
        elif action == "list_rentals_by_owner_id":
            query = """
                        SELECT 
                            r.rental_id, r.start_date, r.end_date, r.total_price, r.payment_status, 
                            u_renter.user_id AS renter_id, u_renter.name AS renter_name, u_renter.email AS renter_email, u_renter.phone AS renter_phone,
                            u_owner.user_id AS owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email, u_owner.phone AS owner_phone,
                            s.storage_id, s.title AS storage_title, s.description AS storage_description, s.size AS storage_size, 
                            s.location AS storage_location, s.price_per_month, s.insurance_option, s.eircode, s.storage_type
                        FROM Rentals r
                        JOIN StorageSpaces s ON r.storage_id = s.storage_id
                        JOIN Users u_renter ON r.renter_id = u_renter.user_id
                        JOIN Users u_owner ON s.owner_id = u_owner.user_id
                        WHERE s.owner_id = ?;
                    """
            params = (data.get("owner_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}

        # Create a rental
        elif action == "create_rental":
            # Ensure no overlapping rentals
            query_check = """
                SELECT COUNT(*) AS count
                FROM Rentals
                WHERE storage_id = ? AND (
                    (start_date <= ? AND end_date >= ?) OR
                    (start_date >= ? AND start_date <= ?)
                );
            """
            params_check = (
                data["storage_id"],
                data["end_date"],
                data["start_date"],
                data["start_date"],
                data["end_date"]
            )
            overlap_result = execute_query(query_check, params_check)
            if overlap_result[0]["count"] > 0:
                return {"statusCode": 400, "body": {"error": "Storage is already rented for the given timeline."}}

            # Insert the new rental
            query = """
                INSERT INTO Rentals (storage_id, renter_id, start_date, end_date, total_price, payment_status)
                VALUES (?, ?, ?, ?, ?, ?);
            """
            params = (
                data["storage_id"],
                data["renter_id"],
                data["start_date"],
                data["end_date"],
                data["total_price"],
                data["payment_status"]
            )
            execute_query(query, params, commit=True)
            return {"statusCode": 200, "body": {"message": "Rental created successfully"}}

        # # Cancel a rental (update payment status) Cancelled this API
        # elif action == "cancel_rental":
        #     query = "UPDATE Rentals SET payment_status = 'canceled', updated_at = GETDATE() WHERE rental_id = ?;"
        #     params = (data.get("rental_id"),)
        #     execute_query(query, params, commit=True)
        #     return {"statusCode": 200, "body": {"message": "Rental canceled successfully"}}

        # Delete a rental
        elif action == "delete_rental":
            rental_id = data.get("rental_id")

            # First, delete associated payment records
            delete_payments_query = "DELETE FROM Payments WHERE rental_id = ?;"
            delete_payments_params = (rental_id,)
            execute_query(delete_payments_query, delete_payments_params, commit=True)

            # Then, delete the rental record
            delete_rental_query = "DELETE FROM Rentals WHERE rental_id = ?;"
            delete_rental_params = (rental_id,)
            execute_query(delete_rental_query, delete_rental_params, commit=True)

            return {"statusCode": 200, "body": {"message": "Rental and associated payments deleted successfully"}}

        #List all Reviews
        elif action == "list_all_reviews":
            query = """
                WITH AvgRatings AS (
                    SELECT 
                        storage_id,
                        AVG(rating) AS average_rating
                    FROM Reviews
                    GROUP BY storage_id
                )
                SELECT 
                    r.review_id, r.rating, r.comment, r.created_at, 
                    r.user_id AS reviewer_id, u_reviewer.name AS reviewer_name, u_reviewer.email AS reviewer_email, u_reviewer.profile_image_url AS reviewer_profile_image,
                    s.storage_id, s.owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email,
                    s.title AS storage_title, s.description AS storage_description,
                    ar.average_rating
                FROM Reviews r
                JOIN StorageSpaces s ON r.storage_id = s.storage_id
                JOIN Users u_reviewer ON r.user_id = u_reviewer.user_id
                JOIN Users u_owner ON s.owner_id = u_owner.user_id
                LEFT JOIN AvgRatings ar ON r.storage_id = ar.storage_id;
            """
            result = execute_query(query)
            return {"statusCode": 200, "body": result}


        #List all Reviews based upon Storage ID
        elif action == "list_reviews_by_storage_id":
            query = """
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
                        ar.average_rating,
                        ROW_NUMBER() OVER (PARTITION BY r.review_id ORDER BY r.created_at DESC) AS row_num
                    FROM Reviews r
                    JOIN StorageSpaces s ON r.storage_id = s.storage_id
                    JOIN Users u_reviewer ON r.user_id = u_reviewer.user_id
                    JOIN Users u_owner ON s.owner_id = u_owner.user_id
                    LEFT JOIN AvgRatings ar ON r.storage_id = ar.storage_id
                    WHERE r.storage_id = ?
                )
                SELECT * 
                FROM RankedReviews
                WHERE row_num = 1;

            """
            params = (data.get("storage_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}


        #List all Reviews based upon Owner ID
        elif action == "list_reviews_by_owner_id":
            query = """
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
                        ar.average_rating,
                        ROW_NUMBER() OVER (PARTITION BY r.review_id ORDER BY r.created_at DESC) AS row_num
                    FROM Reviews r
                    JOIN StorageSpaces s ON r.storage_id = s.storage_id
                    JOIN Users u_reviewer ON r.user_id = u_reviewer.user_id
                    JOIN Users u_owner ON s.owner_id = u_owner.user_id
                    LEFT JOIN AvgRatings ar ON r.storage_id = ar.storage_id
                    WHERE s.owner_id = ?
                )
                SELECT * 
                FROM RankedReviews
                WHERE row_num = 1;
            """
            params = (data.get("owner_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}


        #List review based upon Review ID
        elif action == "list_review_by_review_id":
            query = """
                WITH AvgRatings AS (
                    SELECT 
                        storage_id,
                        AVG(rating) AS average_rating
                    FROM Reviews
                    GROUP BY storage_id
                )
                SELECT 
                    r.review_id, r.rating, r.comment, r.created_at, 
                    r.user_id AS reviewer_id, u_reviewer.name AS reviewer_name, u_reviewer.email AS reviewer_email, u_reviewer.profile_image_url AS reviewer_profile_image,
                    s.storage_id, s.owner_id, u_owner.name AS owner_name, u_owner.email AS owner_email,
                    s.title AS storage_title, s.description AS storage_description,
                    ar.average_rating
                FROM Reviews r
                JOIN StorageSpaces s ON r.storage_id = s.storage_id
                JOIN Users u_reviewer ON r.user_id = u_reviewer.user_id
                JOIN Users u_owner ON s.owner_id = u_owner.user_id
                LEFT JOIN AvgRatings ar ON r.storage_id = ar.storage_id
                WHERE r.review_id = ?;

            """
            params = (data.get("review_id"),)
            result = execute_query(query, params)
            return {"statusCode": 200, "body": result}



        #Creation of the new Review
        elif action == "create_review":
            # Check if the user has already reviewed the storage
            check_query = """
                SELECT review_id
                FROM Reviews
                WHERE storage_id = ? AND user_id = ?;
            """
            check_params = (data["storage_id"], data["user_id"])
            check_result = execute_query(check_query, check_params)

            if check_result:
                # If review exists, update it
                review_id = check_result[0]["review_id"]
                update_query = """
                    UPDATE Reviews
                    SET rating = ?, comment = ?, created_at = GETDATE()
                    WHERE review_id = ?;
                """
                update_params = (data["rating"], data["comment"], review_id)
                execute_query(update_query, update_params, commit=True)
                return {"statusCode": 200, "body": {"message": "Review updated successfully"}}

            # If no review exists, insert a new one
            create_query = """
                INSERT INTO Reviews (storage_id, user_id, rating, comment, created_at)
                VALUES (?, ?, ?, ?, GETDATE());
            """
            create_params = (
                data["storage_id"],
                data["user_id"],
                data["rating"],
                data["comment"]
            )
            execute_query(create_query, create_params, commit=True)
            return {"statusCode": 200, "body": {"message": "Review created successfully"}}

        #Updation of Review
        elif action == "update_review":
            query = """
                UPDATE Reviews
                SET rating = ?, comment = ?, created_at = GETDATE()
                WHERE review_id = ?;
            """
            params = (
                data["rating"],
                data["comment"],
                data["review_id"]
            )
            execute_query(query, params, commit=True)
            return {"statusCode": 200, "body": {"message": "Review updated successfully"}}

        #Deletion of Review
        elif action == "delete_review":
            query = "DELETE FROM Reviews WHERE review_id = ?;"
            params = (data["review_id"],)
            execute_query(query, params, commit=True)
            return {"statusCode": 200, "body": {"message": "Review deleted successfully"}}

        else:
            return format_response(400, {"error": f"Unsupported action: {action}"})

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return format_response(500, {"error": "Internal server error"})
