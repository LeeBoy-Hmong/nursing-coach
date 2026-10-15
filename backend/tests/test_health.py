import pytest

@pytest.mark.asyncio
async def test_health_return(client):
    response = await client.get("/health")
    assert response.status_code == 200