exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { roomDesc, product, style, wish } = JSON.parse(event.body);
    if (!product) return { statusCode: 400, body: JSON.stringify({ error: 'Missing parameters' }) };

    const prompt = `Photorealistic interior design photo. ${roomDesc} The window treatment has been replaced with a ${product} in ${style} color and style.${wish ? ' ' + wish + '.' : ''} All other furniture, walls, floors and lighting remain exactly the same. Professional interior photography, natural daylight, ultra realistic, 4K quality.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return { statusCode: response.status, body: JSON.stringify({ error: err.error?.message || 'Generation failed' }) };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify({ url: data.data[0].url }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
