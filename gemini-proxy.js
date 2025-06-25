// netlify/functions/gemini-proxy.js
// Atau untuk Vercel: api/gemini-proxy.js

exports.handler = async function(event, context) {
    // Pastikan ini adalah permintaan POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Metode tidak diizinkan. Gunakan POST.' }),
        };
    }

    // Pastikan API Key diatur di Environment Variables Netlify/Vercel Anda
    // Buka pengaturan situs Anda di Netlify/Vercel, cari "Environment variables" atau "Build & deploy > Environment"
    // Tambahkan variabel baru: KEY = 'PASTE_KUNCI_API_GEMINI_ANDA_DI_SINI'
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Kunci API Gemini belum dikonfigurasi di server.' }),
        };
    }

    try {
        const { promptText, instruction, responseSchema } = JSON.parse(event.body);

        // Membangun payload untuk Gemini API
        const geminiPayload = {
            contents: [{ role: "user", parts: [{ text: `${instruction}\n\n${promptText}` }] }],
        };

        if (responseSchema) {
            geminiPayload.generationConfig = {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            };
        }

        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
        });

        const result = await response.json();

        // Mengembalikan respons dari Gemini API ke frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Ini penting untuk CORS saat pengembangan lokal, di hosting biasanya sudah dihandle
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Terjadi kesalahan saat memproses permintaan AI.', details: error.message }),
        };
    }
};