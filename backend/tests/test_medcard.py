import pytest

@pytest.mark.asyncio
async def test_medcard_404(client):  # FYI, 
    response = await client.get("/med-cards/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.json()["detail"] == "Your request failed to fetch the required data."
