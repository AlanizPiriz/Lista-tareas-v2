import { useNavigate } from 'react-router-dom';



const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{textAlign: 'center', marginTop:'100px'}}>
            <h1>Seleccionar Area</h1>
            <button onClick={() => navigate('/areas/tienda')}>Tienda</button>
            <button onClick={() => navigate('/areas/pista')}style={{ marginLeft: 20 }}>Pista</button>
        </div>
    )

}


export default Home;