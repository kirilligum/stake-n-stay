import React from 'react';
import './HomePage.css'; // We'll create this CSS file next
import Banner from '../components/Banner';
import Card from '../components/Card';
// import Loading from '../components/Loading'; // If needed for async data

// Placeholder data - in a real app, this would come from an API or Firebase
const sampleCardsData = [
  {
    id: "1",
    src: "https://a0.muscache.com/im/pictures/eb9c7c6a-ee33-414a-b1ba-14e8860d59b3.jpg?im_w=720",
    title: "Online Experiences",
    description: "Unique activities we can do together, led by a world of hosts.",
  },
  {
    id: "2",
    src: "https://a0.muscache.com/im/pictures/15159c9c-9cf1-400e-b809-4e13f286fa38.jpg?im_w=720",
    title: "Unique stays",
    description: "Spaces that are more than just a place to sleep.",
  },
  {
    id: "3",
    src: "https://a0.muscache.com/im/pictures/fdb46962-10c1-45fc-a228-d0b055411448.jpg?im_w=720",
    title: "Entire homes",
    description: "Comfortable private places, with room for friends or family.",
  }
];

const sampleLiveAnywhereData = [
  {
    id: "la1",
    src: "https://a0.muscache.com/im/pictures/miso/Hosting-52594412/original/06055539-5584-43c6-8a73-4657c060f873.jpeg?im_w=720",
    title: "Outdoor getaways",
  },
  {
    id: "la2",
    src: "https://a0.muscache.com/im/pictures/miso/Hosting-610405753900807900/original/2a82b9a0-fd58-49a1-8367-bd6d057b2988.jpeg?im_w=720",
    title: "Unique stays",
  },
  {
    id: "la3",
    src: "https://a0.muscache.com/im/pictures/miso/Hosting-50209017/original/6c0a00a5-6192-4899-a418-009454af4c56.jpeg?im_w=720",
    title: "Entire homes",
  },
  {
    id: "la4",
    src: "https://a0.muscache.com/im/pictures/miso/Hosting-52557546/original/ae014996-3695-40cf-a714-141ac9b8d734.jpeg?im_w=720",
    title: "Pet friendly",
  }
];


function HomePage() {
  // const [loading, setLoading] = useState(false); // Example if fetching data
  // if (loading) return <Loading />;

  return (
    <div className='homePage'>
      <Banner />

      <div className='homePage__section'>
        {sampleCardsData.map(card => (
          <Card
            key={card.id}
            src={card.src}
            title={card.title}
            description={card.description}
            // price="Starting at $100/night" // Optional: if you want to add price here
          />
        ))}
      </div>

      <div className='homePage__section homePage__section--liveAnywhere'>
        <h2>Live anywhere</h2>
        <div className="homePage__liveAnywhereCards">
          {sampleLiveAnywhereData.map(card => (
            <Card
              key={card.id}
              src={card.src}
              title={card.title}
              // description="" // No description for these smaller cards
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
