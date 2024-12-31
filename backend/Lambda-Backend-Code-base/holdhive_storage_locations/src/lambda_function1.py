import json

from db_client import get_storage_locations
from utils import format_response

def lambda_handler(event, context):
    """
    Main Lambda entry point for handling all the requests related to storage location space
    """
    try:
        print(f"Event: {json.dumps(event)}")
        # Call the database client to fetch storage locations
        storage_locations = get_storage_locations()

        # Return success response with data
        return format_response(200, {
            "message": "Storage locations fetched successfully.",
            "data": storage_locations
        })
    except Exception as e:
        print(f"Error fetching storage locations: {str(e)}")
        
        # Return error response
        return format_response(500, {
            "error": "Failed to fetch storage locations."
        })
