(function () {
    'use strict';

    const search = searchQuery => {
      const query = {
        api_key: 'shJ0RHv5Sj1O9s0nGlBfU5xsGAoBX81F',
        q: searchQuery
      }; // Fetch GIFs with your API key and search query.

      fetch(`https://api.giphy.com/v1/gifs/search?${search.stringify(query)}`).then(response => response.json()); // Parse the JSON data.
    };

    search(searchQuery).then(variable => {});

}());
//# sourceMappingURL=giphy.js.map
