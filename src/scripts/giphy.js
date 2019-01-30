'user strict'

import queryString from 'query-string';

const search = searchQuery => {

  const query = {
    api_key:process.env.GIPHY_API_KEY,
    q:searchQuery
  };

  // Fetch GIFs with your API key and search query.
  return fetch(`https://api.giphy.com/v1/gifs/search?${queryString.stringify(query)}`)
    .then(response => response.json()) // Parse the JSON data.

};

export default search;
