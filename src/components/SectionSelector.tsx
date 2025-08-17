import { useParams, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const SectionSelector = () => {
  const { area } = useParams();
  const navigate = useNavigate();

  const goToSection = (section: string) => {
    navigate(`/areas/${area}/${section}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Seleccionar sección para el área: {area}</h2>
      <button onClick={() => goToSection('mantenimiento')}>🔧 Mantenimiento</button>
      <button onClick={() => goToSection('tareas')} style={{ marginLeft: 20 }}>📋 Tareas</button>

      <BackButton />
    </div>
  );
};

export default SectionSelector;
