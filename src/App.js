import logo from './logo.svg';
import './App.css';

function App() {
  const [xmlData, setXmlData] = useState('');

  useEffect(() => {
    fetch('/welds')
      .then(response => response.text())
      .then(xml => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'application/xml');
        setXmlData(xmlDoc.documentElement.innerHTML);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: xmlData }}></div>
  );
}

export default App;
