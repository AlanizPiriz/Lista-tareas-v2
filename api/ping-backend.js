export const config = {
  schedule: '58 8 * * *', // 8:58 AM UTC todos los días
};

export default async function handler(req, res) {
  const backendUrl = 'https://lista-tareas-backend.onrender.com/ping';

  try {
    const response = await fetch(backendUrl);
    const text = await response.text();

    console.log('✅ Ping enviado con éxito al backend:', text);

    res.status(200).json({ success: true, backendResponse: text });
  } catch (err) {
    console.error('❌ Error al hacer ping al backend:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
