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

    # print(f"Response: {response}")
    # Parse the response from db_transactions
    payload = json.loads(response['Payload'].read())
    print(f"Payload: {payload}")
    if payload.get("statusCode") != 200:
        db_error = payload.get("body", payload.get("error", "Unknown error"))
        raise Exception(f"DB Error: {db_error}")
    return payload.get("body")

def lambda_handler(event, context):
    """
    Handles user profile-related API requests.
    """
    try:
        print(f"Event: {event}")

        # Extract HTTP method
        http_method = event.get("httpMethod")

        #extracting the path from the event
        path = event.get("path")

        # For GET requests, use query parameters
        if http_method == "GET" and path == "/profile/list-all-users":
            response = call_db_transactions("list_all_users", {})
            return {
                "statusCode": 200, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                "body": json.dumps({"message": "Users fetched successfully", "data": response})}

        elif http_method == "GET":
            query_params = event.get("queryStringParameters", {})
            action = query_params.get("action")
            user_id = query_params.get("user_id")

        elif http_method in ["POST", "PUT"]:
            body = json.loads(event.get("body", "{}"))
            action = body.get("action")
            data = body.get("data", {})

        if action == "create_account":
            # Ensure required fields are provided
            user_id = data.get("user_id")
            email = data.get("email")
            role_name = data.get("role_name")
            if not user_id or not email:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "user_id and email are required"})
                }
            
            # Call the db_transactions Lambda to create the account
            response = call_db_transactions("create_account", {"user_id": user_id, "email": email, "role_name": role_name})
            return {
                "statusCode": 200, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                "body": json.dumps(response)
            }

        elif action == "update_profile":
            # Ensure required fields are provided
            user_id = data.get("user_id")
            profile_data = data.get("profile_data")
            # print(f"User_id: {user_id}")
            # print(f"profile_data: {profile_data}")
            if not user_id or not profile_data:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "user_id and profile_data are required"})
                }
            
            # Call the db_transactions Lambda to update the profile
            response = call_db_transactions("update_profile", {"user_id": user_id, "profile_data": profile_data})
            return {
                "statusCode": 200, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(response)
            }

        elif action == "get_user_profile":
            # Ensure required fields are provided
            # user_id = data.get("user_id")
            if not user_id:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "user_id is required"})
                }
            
            # Call the db_transactions Lambda to fetch the user profile
            response = call_db_transactions("get_user_profile", {"user_id": user_id})
            return {
                "statusCode": 200, 
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(response)
            }
        
        elif action == "update_user_role":
            # Ensure required fields are provided
            email_id = data.get("user_email_id")
            # print(f"User_id: {user_id}")
            # print(f"profile_data: {profile_data}")
            if not email_id:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "user_email_id is required"})
                }
            
            # Call the db_transactions Lambda to update the profile
            response = call_db_transactions("update_user_role", {"email_id": email_id})
            return {
                    "statusCode": 200, 
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps(response)
                    }

        elif action == "remove_user":
            # Ensure required fields are provided
            user_id = data.get("user_id")
            if not user_id:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": "user_id is required"})
                }
            
            # Call the db_transactions Lambda to create the account
            response = call_db_transactions("remove_user", {"user_id": user_id})
            return {
                "statusCode": 200,
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                "body": json.dumps(response)
            }

        else:
            return {
                "statusCode": 400,
                "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                "body": json.dumps({"error": "Unsupported action"})
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
            "body": json.dumps({"error": str(e)})
        }
