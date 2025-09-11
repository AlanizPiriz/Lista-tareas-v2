export const config = {
  schedule: '58 8 * * *', 
};

export default async function handler(req, res) {
  const backendUrl = 'https://lista-tareas-backend.onrender.com/ping';

  try {
    const response = await fetch(backendUrl);
    const data = await response.json();

    console.log('✅ Ping enviado con éxito al backend:', data);

    res.status(200).json({ success: true, backendResponse: data });
  } catch (err) {
    console.error('❌ Error al hacer ping al backend:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
