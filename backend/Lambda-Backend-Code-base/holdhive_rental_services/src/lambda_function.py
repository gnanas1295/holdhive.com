import json
import boto3
import os

# Initialize the AWS Lambda client
lambda_client = boto3.client('lambda')

def call_db_transactions(action, data):
    """
    Calls the db_transactions Lambda for database operations.
    """
    response = lambda_client.invoke(
        FunctionName=os.environ['db_lambda_name'],
        InvocationType="RequestResponse",
        Payload=json.dumps({"action": action, "data": data})
    )

    # Parse the response from db_transactions
    payload = json.loads(response['Payload'].read())
    if payload.get("statusCode") != 200:
        raise Exception(f"DB Error: {payload.get('body', {}).get('error', 'Unknown Error')}")
    return payload.get("body")

def lambda_handler(event, context):
    """
    Handles rental-related API requests.
    """
    try:
        print(f"Event: {event}")
        http_method = event.get("httpMethod")
        path = event.get("path")
        data = json.loads(event.get("body", "{}")) if http_method == "POST" else event.get("queryStringParameters", {})

        if http_method == "GET":
            # List all rentals
            if path == "/rental-service/list-all-rentals":
                response = call_db_transactions("list_all_rentals", {})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rentals fetched successfully", "data": response})
                }

            # List rental by rental ID
            if path.startswith("/rental-service/list-rental-by-rental-id"):
                query_params = event.get("queryStringParameters", {})
                rental_id = query_params.get("rental_id")
                response = call_db_transactions("list_rental_by_id", {"rental_id": rental_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rental fetched successfully", "data": response})
                }

            # List rentals by storage ID
            if path.startswith("/rental-service/list-rental-by-storage-id"):
                query_params = event.get("queryStringParameters", {})
                storage_id = query_params.get("storage_id")
                response = call_db_transactions("list_rentals_by_storage_id", {"storage_id": storage_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rentals for storage fetched successfully", "data": response})
                }

            # List rentals by renter ID
            if path.startswith("/rental-service/list-rental-by-renter-id"):
                query_params = event.get("queryStringParameters", {})
                renter_id = query_params.get("renter_id")
                response = call_db_transactions("list_rentals_by_renter_id", {"renter_id": renter_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rentals for renter fetched successfully", "data": response})
                }

            # List rentals by owner ID
            if path.startswith("/rental-service/list-rental-by-owner-id"):
                query_params = event.get("queryStringParameters", {})
                owner_id = query_params.get("owner_id")
                response = call_db_transactions("list_rentals_by_owner_id", {"owner_id": owner_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rentals for owner fetched successfully", "data": response})
                }

        elif http_method == "POST":
            action = data.get("action")

            # Create a rental
            if action == "create_rental":
                response = call_db_transactions("create_rental", data)
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rental created successfully", "data": response})
                }

            # Delete a rental
            elif action == "delete_rental":
                rental_id = data.get("rental_id")
                if not rental_id:
                    return {
                            "statusCode": 400, 
                            "headers": {
                                "Access-Control-Allow-Origin": "*",
                            },
                            "body": json.dumps({"error": "rental_id is required"})
                            }
                response = call_db_transactions("delete_rental", {"rental_id": rental_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Rental deleted successfully", "data": response})
                }

        else:
            return {
                "statusCode": 405, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Method not allowed"})
                }

    except Exception as e:
        return {
                "statusCode": 500, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": str(e)})
                }
