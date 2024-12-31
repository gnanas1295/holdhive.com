import boto3
import json
import os

# Initialize the Lambda client
lambda_client = boto3.client('lambda')

# Name of the DB Lambda function
DB_LAMBDA_NAME = os.environ['DB_LAMBDA_NAME']

def get_storage_locations():
    """
    Invokes the database Lambda to fetch storage locations.
    """
    try:
        # Invoke the database Lambda
        response = lambda_client.invoke(
            FunctionName=DB_LAMBDA_NAME,
            InvocationType='RequestResponse',  # Synchronous call
            Payload=json.dumps({
                "action": "list_storage_locations"  # Action parameter to identify operation
            })
        )
        
        # Parse the response from the DB Lambda
        db_response = json.loads(response['Payload'].read())
        
        if db_response.get("statusCode") == 200:
            return db_response["body"]
        else:
            raise Exception(db_response.get("error", "Unknown error from DB Lambda"))

    except Exception as e:
        print(f"Error in DB Lambda invocation: {str(e)}")
        raise
