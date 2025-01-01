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
    Handles review-related API requests.
    """
    try:
        print(f"Event: {event}")
        http_method = event.get("httpMethod")
        path = event.get("path")
        data = json.loads(event.get("body", "{}")) if http_method == "POST" else event.get("queryStringParameters", {})

        if http_method == "GET":
            if path == "/review-service/list-reviews":
                # List all reviews
                response = call_db_transactions("list_all_reviews", {})
                return {
                        "statusCode": 200, 
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Reviews fetched successfully", "data": response})
                        }

            elif path.startswith("/review-service/list-reviews-by-storage-id"):
                # List reviews by storage_id
                query_params = event.get("queryStringParameters", {})
                storage_id = query_params.get("storage_id")
                response = call_db_transactions("list_reviews_by_storage_id", {"storage_id": storage_id})
                return {
                        "statusCode": 200, 
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Reviews for storage fetched successfully", "data": response})
                        }

            elif path.startswith("/review-service/list-reviews-by-owner-id"):
                # List reviews by storage owner
                query_params = event.get("queryStringParameters", {})
                owner_id = query_params.get("owner_id")
                response = call_db_transactions("list_reviews_by_owner_id", {"owner_id": owner_id})
                return {
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Reviews for owner fetched successfully", "data": response})
                        }
            
            elif path.startswith("/review-service/list-reviews-by-review-id"):
                #List reviews by Review ID
                query_params = event.get("queryStringParameters", {})
                review_id = query_params.get("review_id")
                response = call_db_transactions("list_review_by_review_id", {"review_id": review_id})
                return {
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Review fetched successfully", "data": response})
                        }


        elif http_method == "POST":
            action = data.get("action")

            if action == "create_review":
                # Create a new review
                response = call_db_transactions("create_review", data)
                return {
                        "statusCode": 200, 
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Review created successfully", "data": response})
                        }

            elif action == "update_review":
                # Update a review
                response = call_db_transactions("update_review", data)
                return {
                        "statusCode": 200, 
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps({"message": "Review updated successfully", "data": response})
                        }

            elif action == "delete_review":
                # Delete a review
                response = call_db_transactions("delete_review", data)
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"message": "Review deleted successfully", "data": response})
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
