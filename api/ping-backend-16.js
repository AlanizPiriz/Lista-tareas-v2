module.exports.config = {
  schedule: '58 15 * * *', // 16:00 UTC todos los días
};

module.exports = async function handler(req, res) {
  const backendUrl = 'https://lista-tareas-backend.onrender.com/ping';

  try {
    const response = await fetch(backendUrl);
    const text = await response.text();

    console.log('✅ Ping enviado con éxito al backend (16h):', text);

    res.status(200).json({ success: true, backendResponse: text });
  } catch (err) {
    console.error('❌ Error al hacer ping al backend (16h):', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
