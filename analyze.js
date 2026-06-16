exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { image, mime } = JSON.parse(event.body);
    if (!image) return { statusCode: 400, body: JSON.stringify({ error: 'No image' }) };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime || 'image/jpeg', data: image } },
            { type: 'text', text: 'Describe this room in 2 short English sentences: room type, window size and position, existing window treatment, main furniture. Be specific and concise.' }
          ]
        }]
      })
    });

    const data = await response.json();
    const description = data.content?.[0]?.text || 'A bright room with a window.';
    return { statusCode: 200, body: JSON.stringify({ description }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
