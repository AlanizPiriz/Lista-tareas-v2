import { useNavigate } from 'react-router-dom';



const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{textAlign: 'center', marginTop:'100px'}}>
            <h1>Seleccionar Area</h1>
            <button onClick={() => navigate('/tasks/tienda')}>Tienda</button>
            <button onClick={() => navigate('/tasks/pista')}style={{ marginLeft: 20 }}>Pista</button>
        </div>
    )

}


export default Home;