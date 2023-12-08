import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

export default function useWatchEvent<T>(
  fetchFn: () => Promise<T | null>,
  intervalInSecond = 1
) {
  const [event, setEvent] = useState<T | null>(null);
  const [isActive, setIsActive] = useState(true);
  const client = usePublicClient();
  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;

    // Function to fetch events and update the state
    const fetchEvents = async () => {
      try {
        const newEvent = await fetchFn();
        if (newEvent) {
          setEvent(newEvent);
          return;
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Fetch events immediately when the component mounts
    fetchEvents()
      .then(() => console.log('fetched events'))
      .catch((err) => console.log(err));

    if (isActive) {
      // Set up an interval to fetch events every 'intervalInMinutes' minutes
      intervalId = setInterval(fetchEvents, intervalInSecond * 1000);
    }

    // Clear the interval when the component unmounts or when isActive becomes false
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchFn, intervalInSecond, isActive]);

  const stopWatch = () => {
    setIsActive(false);
  };

  return { event, stopWatch };
}
