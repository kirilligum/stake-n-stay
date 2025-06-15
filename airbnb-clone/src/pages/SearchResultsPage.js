import React from 'react';
import './SearchResultsPage.css'; // We'll create this CSS file next
// import Card from '../components/Card'; // Or a new SearchResultCard component
// import Loading from '../components/Loading';
// import { useLocation } from 'react-router-dom'; // To get search query/params

function SearchResultsPage() {
  // const location = useLocation();
  // const [results, setResults] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Fetch results based on location.search or state passed in navigation
  //   // For now, using placeholder
  //   console.log("Search params might be:", location.search);
  //   setLoading(false);
  // }, [location]);

  // if (loading) return <Loading />;

  return (
    <div className='searchResultsPage'>
      {/* <p>Search query: {location.search}</p> */}
      <h1>Search Results</h1>
      <p>Display search results here. This is a placeholder.</p>
      {/*
      <div className="searchResultsPage__results">
        {results.length > 0 ? (
          results.map(item => (
            // <Card key={item.id} src={item.img} title={item.title} description={item.description} price={item.price} />
            // Or a specific SearchResultCard component
          ))
        ) : (
          <p>No results found for your search.</p>
        )}
      </div>
      */}
    </div>
  );
}

export default SearchResultsPage;
