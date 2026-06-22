// Function to fetch config.json and get the base URL
const getBaseUrl = () => {
  // const fetchDetails = async () => {
  //   try {
  //     // Fetch the config.json file
  //     const response = await fetch('/config.json');

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     // Parse the JSON response
  //     const config = await response.json();

  //     // Extract configuration values
  //     const backendIP = await config.backendUrl;

  //     // Return the base URL based on the config
  //     return `http://${backendIP}/`;
  //   } catch (error) {
  //     console.error('Error fetching config:', error);
  //     return 'https://localhost:82/';
  //   }
  // };

  return process.env.REACT_APP_BACKEND_URL;

};
export default getBaseUrl;
