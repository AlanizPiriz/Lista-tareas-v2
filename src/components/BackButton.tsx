import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={() => navigate(-1)} className='volver'>← Volver</button>
    </div>
  );
};

export default BackButton;
