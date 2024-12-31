import json
import boto3
import os
from datetime import datetime

# Initialize the AWS Lambda client
lambda_client = boto3.client('lambda')

def call_db_transactions(action, data):
    """
    Calls the db_transactions Lambda for database operations.
    """
    response = lambda_client.invoke(
        FunctionName=os.environ['DB_LAMBDA_NAME'],  # Use an environment variable for the DB Lambda name
        InvocationType="RequestResponse",
        Payload=json.dumps({"action": action, "data": data})
    )

    # Parse the response from db_transactions
    payload = json.loads(response['Payload'].read())
    if payload.get("statusCode") != 200:
        raise Exception(f"DB Error: {payload.get('body', {}).get('error', 'Unknown Error')}")
    return payload.get("body")

def calculate_price(price_per_month, days):
    """
    Calculates the price based on the number of rental days.
    If days < 30, use 30 days for calculation.
    """
    daily_price = price_per_month / 30
    effective_days = max(days, 30)
    return daily_price * effective_days

def lambda_handler(event, context):
    """
    Main Lambda entry point for handling all the requests related to storage location space
    """
    try:
        print(f"Event: {event}")
        # Determine HTTP method and route
        http_method = event.get("httpMethod")
        path = event.get("path")
        data = json.loads(event.get("body", "{}")) if http_method == "POST" else event.get("queryStringParameters", {})

        # Route actions based on path and method
        if http_method == "GET":
            if path == "/storage-location/list-storage-location":
                # List all storage locations
                response = call_db_transactions("list_all_storage_locations", {})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage locations fetched successfully", "data": response})
                }
            elif path.startswith("/storage-location/list-storage-location-by-id"):
                # Fetch storage by ID
                query_params = event.get("queryStringParameters", {})
                storage_id = query_params.get("storage_id")
                response = call_db_transactions("fetch_storage_by_id", {"storage_id": storage_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location fetched successfully", "data": response})
                }
            elif path.startswith("/storage-location/list-storage-location-by-owner-id"):
                # Fetch storage by ID
                query_params = event.get("queryStringParameters", {})
                owner_id = query_params.get("user_id")
                response = call_db_transactions("fetch_storage_by_owner_id", {"owner_id": owner_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location fetched successfully", "data": response})
                }
            elif path.startswith("/storage-location/list-storage-location-available-date-range"):
                # Fetch storage by ID
                query_params = event.get("queryStringParameters", {})
                start_date = query_params.get("start_date")
                end_date = query_params.get("end_date")
                if not start_date or not end_date:
                    return {
                        "statusCode": 400,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"error": "start_date and end_date are required"})
                    }
                response = call_db_transactions("check_available_storage", {"start_date": start_date,"end_date": end_date})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location fetched successfully", "data": response})
                }
            elif path.startswith("/storage-location/check-availablity-date-storage-id"):
                query_params = event.get("queryStringParameters", {})
                storage_id = query_params.get("storage_id")
                start_date = query_params.get("start_date")
                end_date = query_params.get("end_date")
                if not storage_id or not start_date or not end_date:
                    return {
                        "statusCode": 400,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"error": "storage_id, start_date, and end_date are required"})
                    }

                # Check availability
                response = call_db_transactions("check_storage_availability", {
                    "storage_id": storage_id,
                    "start_date": start_date,
                    "end_date": end_date
                })

                if not response.get("available", False):
                    return {
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Storage location is not available"})
                    }

                # Fetch storage price details
                storage_details = call_db_transactions("get_storage_price", {"storage_id": storage_id})
                price_per_month = storage_details.get("price_per_month")
                if not price_per_month:
                    return {
                        "statusCode": 500,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"error": "Unable to fetch storage price details"})
                    }

                # Calculate the final price
                days = (datetime.strptime(end_date, "%Y-%m-%d") - datetime.strptime(start_date, "%Y-%m-%d")).days
                final_price = calculate_price(price_per_month, days)

                return {
                    "statusCode": 200,
                    "headers": {
                            "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({
                        "message": "Storage location is available",
                        "final_price": final_price,
                        "days": days
                    })
                }

        elif http_method == "POST":
            action = data.get("action")

            if action == "add_storage_location":
                # Add new storage location
                response = call_db_transactions("add_storage_location", data)
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location added successfully", "data": response})
                }

            elif action == "delete_storage_location":
                # Delete a storage location
                storage_id = data.get("storage_id")
                if not storage_id:
                    return {
                        "statusCode": 400,
                        "headers": {
                        "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"error": "storage_id is required"})
                    }
                response = call_db_transactions("delete_storage_location", {"storage_id": storage_id})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location deleted successfully", "data": response})
                }

            elif action == "update_storage_location":
                # Update a storage location
                storage_id = data.get("storage_id")
                update_data = data.get("update_data")
                if not storage_id or not update_data:
                    return {
                        "statusCode": 400,
                        "headers": {
                        "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"error": "storage_id and update_data are required"})
                    }
                response = call_db_transactions("update_storage_location", {"storage_id": storage_id, "update_data": update_data})
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Storage location updated successfully", "data": response})
                }

            else:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "Unsupported action"})
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
