// Import the VERTEX_AI_CONFIG from config.js
import VERTEX_AI_CONFIG from './config.js';

export default async function decorate(block) {
    try {
        // Construct the API URL using the configuration values
        const apiUrl = `${VERTEX_AI_CONFIG.indexEndpoint}/v1/projects/${VERTEX_AI_CONFIG.projectId}/locations/${VERTEX_AI_CONFIG.location}/catalogs`;

        // Fetch data from Vertex AI Commerce API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERTEX_AI_CONFIG.apiKey}` // Use the API key from the config.js
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from Vertex AI Commerce API');
        }

        const data = await response.json();

        // Extract catalog and product data
        const catalogName = data.displayName || "Unknown Catalog";
        const ingestionType = data.productLevelConfig?.ingestionProductType || "N/A";
        const merchantId = data.merchantCenterLinkingConfig?.linkedMerchantCenterAccounts?.[0]?.merchantId || "N/A";
        const destination = data.merchantCenterLinkingConfig?.linkedMerchantCenterAccounts?.[0]?.destinationConfigs?.[0]?.destination || "N/A";
        const regionCode = data.merchantCenterLinkingConfig?.linkedMerchantCenterAccounts?.[0]?.destinationConfigs?.[0]?.regionCode || "N/A";
        const products = data.products || [];

        // Render catalog and products
        block.innerHTML = `
            <div style="font-family: Arial, sans-serif; color: #333; margin: 20px;">
                <h3 style="font-size: 1.5rem; color: #2c3e50; margin-bottom: 10px;">Catalog Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${catalogName}</p>
                <p style="margin: 5px 0;"><strong>Ingestion Type:</strong> ${ingestionType}</p>
                <p style="margin: 5px 0;"><strong>Merchant ID:</strong> ${merchantId}</p>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${destination}</p>
                <p style="margin: 5px 0;"><strong>Region:</strong> ${regionCode}</p>
                <hr style="border: 1px solid #ccc;">
                <h3 style="font-size: 1.5rem; color: #2c3e50; margin-bottom: 10px;">Products</h3>
                <ul style="list-style-type: none; padding: 0;">
                    ${products.map(product => `
                        <li style="display: flex; margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); background-color: #fff;">
                            <img src="${product.images?.[0]?.uri}" alt="${product.title}" style="max-width: 80px; max-height: 80px; margin-right: 15px;">
                            <div style="flex: 1;">
                                <strong style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">${product.title}</strong>
                                <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">${product.description}</p>
                                <p><strong>Price:</strong> ${product.priceInfo.currencyCode} $${product.priceInfo.price}</p>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching data from Vertex AI Commerce API:", error);
        block.innerHTML = "<p>Failed to load catalog and product data from API.</p>";
    }
}
