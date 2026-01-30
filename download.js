// api/download.js
import fetch from 'node-fetch'; // Vercel's Node.js environment has fetch available

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing Game ID" });
    }

    // Roblox Asset Delivery URL for places (games)
    // Note: This API typically requires the place to be 'copylocked=false' or owned by the user
    // or accessed via a privileged token for private places.
    // For public games, it might work, but Roblox has rate limits and potential IP blocks.
    // In a real-world scenario for public games, you might need a proxy.
    const assetUrl = `https://assetdelivery.roblox.com/v1/asset/?id=${id}`;

    try {
        const response = await fetch(assetUrl);

        if (!response.ok) {
            // Try to get more specific error from Roblox if available
            const errorText = await response.text();
            console.error(`Roblox API Error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({
                error: "Failed to fetch game from Roblox.",
                detail: `Roblox API responded with status ${response.status}. It might be a private game, an invalid ID, or Roblox blocking the request.`
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="flexin2048_${id}.rbxl"`);

        // Stream the response directly to the client
        response.body.pipe(res);

    } catch (error) {
        console.error("Error during game download:", error);
        res.status(500).json({ error: "Internal server error during game download.", detail: error.message });
    }
}