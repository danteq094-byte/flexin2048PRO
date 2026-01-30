// api/download.js
export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "No ID provided" });

    try {
        // 1. Buscamos el nombre del juego usando la API de Roblox (vía Proxy)
        const infoRes = await fetch(`https://games.roproxy.com/v1/games/multiget-place-details?placeIds=${id}`);
        const infoData = await infoRes.json();
        
        // Limpiamos el nombre para que no tenga caracteres raros
        let fileName = infoData[0]?.name ? infoData[0].name.replace(/[^a-z0-9]/gi, '_') : "FlexinGame";

        // 2. Intentamos descargar el archivo .rbxl (que es el formato de juegos/mapas)
        const assetUrl = `https://assetdelivery.roproxy.com/v1/asset/?id=${id}`;
        const response = await fetch(assetUrl);

        if (!response.ok) throw new Error("Uncopylocked only or Invalid ID");

        // 3. Enviamos el archivo con el nombre del juego y extensión .rbxm como pediste
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.rbxm"`);

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        res.status(500).json({ error: "Download failed", detail: "Ensure the game is Uncopylocked." });
    }
}
