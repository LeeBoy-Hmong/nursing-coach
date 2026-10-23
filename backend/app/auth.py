## Authentication -- used to handle stateless authentication and authorization.
import jwt
from jwt import PyJWKClient
import uuid
from app.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status

# Create Constances for security setting -- one place to find them & one place to change them.
ALGORITHM = ["ES256","RS256"]
AUDIENCE = "authenticated"

# Create the client JWT key -- use the url instead of a hardcode.
# The key will rotate, using JWKS it'll pick up the new key automatically.
jwk_client = PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")
# Create a way to read the header. First create the instance for the bearer.
# auto_error=False allows custom exception handlers to deal with missing tokens cleanly.
security_bearer = HTTPBearer(auto_error=False)

# Create a dependency function -- an async function to get the current user. Annotate to a uuid.
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> uuid.UUID:
    """
    FastAPI dependency that extracts, verifies, and parses the JWT token,
    returning the User ID as a native Python UUID instance.
    """   
    if credentials is None:
        raise HTTPException(status_code=401, detail="Client Error: Unauthorized Request")
    try: 
    # get the signing key -- create the payload with jwt.decode()
        jwk_signin_key = jwk_client.get_signing_key_from_jwt(credentials.credentials)
        payload = jwt.decode(
        credentials.credentials,
        jwk_signin_key.key,
        algorithms=ALGORITHM,
        audience=AUDIENCE
    )  # create the payload with jwt.decode(...) with algorithms and audience
        # return uuid.UUID(payload["sub"])
        return uuid.UUID(payload["sub"])  # returns the subject (the ID) -- "Who this token is about"
    except jwt.PyJWTError:  # Create an Error handler -- Catch JWT.PyJWTError, raise an exception statuse of 401 (Unauthorized token)
        raise HTTPException(status_code=401, detail="Unauthorized, invalid, or expired token.")  # on failure -> HTTPException(401)
    # An extra HTTPSException raise -- Catch case but isn't a valid UUID
    except ValueError:
        raise HTTPException(status_code=401, detail="Token is not a valid user ID format.")
