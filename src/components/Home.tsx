import { useNavigate } from 'react-router-dom';



const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{textAlign: 'center', marginTop:'100px'}}>
            <h1>Seleccionar Area</h1>
            <button onClick={() => navigate('/areas/TIENDA')}>Tienda</button>
            <button onClick={() => navigate('/areas/PISTA')}style={{ marginLeft: 20 }}>Pista</button>
            <button onClick={() => navigate('/historial')}>🕓 Ver historial</button>
        </div>
    )

}


export default Home;