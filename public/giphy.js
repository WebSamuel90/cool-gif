(function () {
    'use strict';

    var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

    var token = '%[a-f0-9]{2}';
    var singleMatcher = new RegExp(token, 'gi');
    var multiMatcher = new RegExp('(' + token + ')+', 'gi');

    function decodeComponents(components, split) {
      try {
        // Try to decode the entire string first
        return decodeURIComponent(components.join(''));
      } catch (err) {// Do nothing
      }

      if (components.length === 1) {
        return components;
      }

      split = split || 1; // Split the array in 2 parts

      var left = components.slice(0, split);
      var right = components.slice(split);
      return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
    }

    function decode(input) {
      try {
        return decodeURIComponent(input);
      } catch (err) {
        var tokens = input.match(singleMatcher);

        for (var i = 1; i < tokens.length; i++) {
          input = decodeComponents(tokens, i).join('');
          tokens = input.match(singleMatcher);
        }

        return input;
      }
    }

    function customDecodeURIComponent(input) {
      // Keep track of all the replacements and prefill the map with the `BOM`
      var replaceMap = {
        '%FE%FF': '\uFFFD\uFFFD',
        '%FF%FE': '\uFFFD\uFFFD'
      };
      var match = multiMatcher.exec(input);

      while (match) {
        try {
          // Decode as big chunks as possible
          replaceMap[match[0]] = decodeURIComponent(match[0]);
        } catch (err) {
          var result = decode(match[0]);

          if (result !== match[0]) {
            replaceMap[match[0]] = result;
          }
        }

        match = multiMatcher.exec(input);
      } // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else


      replaceMap['%C2'] = '\uFFFD';
      var entries = Object.keys(replaceMap);

      for (var i = 0; i < entries.length; i++) {
        // Replace all decoded components
        var key = entries[i];
        input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
      }

      return input;
    }

    var decodeUriComponent = function (encodedURI) {
      if (typeof encodedURI !== 'string') {
        throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
      }

      try {
        encodedURI = encodedURI.replace(/\+/g, ' '); // Try the built in decoder first

        return decodeURIComponent(encodedURI);
      } catch (err) {
        // Fallback to a more advanced decoder
        return customDecodeURIComponent(encodedURI);
      }
    };

    function encoderForArrayFormat(options) {
      switch (options.arrayFormat) {
        case 'index':
          return (key, value, index) => {
            return value === null ? [encode(key, options), '[', index, ']'].join('') : [encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('');
          };

        case 'bracket':
          return (key, value) => {
            return value === null ? [encode(key, options), '[]'].join('') : [encode(key, options), '[]=', encode(value, options)].join('');
          };

        default:
          return (key, value) => {
            return value === null ? encode(key, options) : [encode(key, options), '=', encode(value, options)].join('');
          };
      }
    }

    function parserForArrayFormat(options) {
      let result;

      switch (options.arrayFormat) {
        case 'index':
          return (key, value, accumulator) => {
            result = /\[(\d*)\]$/.exec(key);
            key = key.replace(/\[\d*\]$/, '');

            if (!result) {
              accumulator[key] = value;
              return;
            }

            if (accumulator[key] === undefined) {
              accumulator[key] = {};
            }

            accumulator[key][result[1]] = value;
          };

        case 'bracket':
          return (key, value, accumulator) => {
            result = /(\[\])$/.exec(key);
            key = key.replace(/\[\]$/, '');

            if (!result) {
              accumulator[key] = value;
              return;
            }

            if (accumulator[key] === undefined) {
              accumulator[key] = [value];
              return;
            }

            accumulator[key] = [].concat(accumulator[key], value);
          };

        default:
          return (key, value, accumulator) => {
            if (accumulator[key] === undefined) {
              accumulator[key] = value;
              return;
            }

            accumulator[key] = [].concat(accumulator[key], value);
          };
      }
    }

    function encode(value, options) {
      if (options.encode) {
        return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
      }

      return value;
    }

    function decode$1(value, options) {
      if (options.decode) {
        return decodeUriComponent(value);
      }

      return value;
    }

    function keysSorter(input) {
      if (Array.isArray(input)) {
        return input.sort();
      }

      if (typeof input === 'object') {
        return keysSorter(Object.keys(input)).sort((a, b) => Number(a) - Number(b)).map(key => input[key]);
      }

      return input;
    }

    function extract(input) {
      const queryStart = input.indexOf('?');

      if (queryStart === -1) {
        return '';
      }

      return input.slice(queryStart + 1);
    }

    function parse(input, options) {
      options = Object.assign({
        decode: true,
        arrayFormat: 'none'
      }, options);
      const formatter = parserForArrayFormat(options); // Create an object with no prototype

      const ret = Object.create(null);

      if (typeof input !== 'string') {
        return ret;
      }

      input = input.trim().replace(/^[?#&]/, '');

      if (!input) {
        return ret;
      }

      for (const param of input.split('&')) {
        let [key, value] = param.replace(/\+/g, ' ').split('='); // Missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters

        value = value === undefined ? null : decode$1(value, options);
        formatter(decode$1(key, options), value, ret);
      }

      return Object.keys(ret).sort().reduce((result, key) => {
        const value = ret[key];

        if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
          // Sort object keys, not values
          result[key] = keysSorter(value);
        } else {
          result[key] = value;
        }

        return result;
      }, Object.create(null));
    }

    var extract_1 = extract;
    var parse_1 = parse;

    var stringify = (obj, options) => {
      if (!obj) {
        return '';
      }

      options = Object.assign({
        encode: true,
        strict: true,
        arrayFormat: 'none'
      }, options);
      const formatter = encoderForArrayFormat(options);
      const keys = Object.keys(obj);

      if (options.sort !== false) {
        keys.sort(options.sort);
      }

      return keys.map(key => {
        const value = obj[key];

        if (value === undefined) {
          return '';
        }

        if (value === null) {
          return encode(key, options);
        }

        if (Array.isArray(value)) {
          const result = [];

          for (const value2 of value.slice()) {
            if (value2 === undefined) {
              continue;
            }

            result.push(formatter(key, value2, result.length));
          }

          return result.join('&');
        }

        return encode(key, options) + '=' + encode(value, options);
      }).filter(x => x.length > 0).join('&');
    };

    var parseUrl = (input, options) => {
      const hashStart = input.indexOf('#');

      if (hashStart !== -1) {
        input = input.slice(0, hashStart);
      }

      return {
        url: input.split('?')[0] || '',
        query: parse(extract(input), options)
      };
    };

    var queryString = {
    	extract: extract_1,
    	parse: parse_1,
    	stringify: stringify,
    	parseUrl: parseUrl
    };

    const search = searchQuery => {
      const query = {
        api_key: 'shJ0RHv5Sj1O9s0nGlBfU5xsGAoBX81F',
        q: searchQuery
      }; // Fetch GIFs with your API key and search query.

      return fetch(`https://api.giphy.com/v1/gifs/search?${queryString.stringify(query)}`).then(response => response.json()); // Parse the JSON data.
    };

    const searchField = document.querySelector('.search__field');
    const searchForm = document.forms.namedItem('search');
    const gallery = document.querySelector('.gallery');

    function createGif(gif) {
      const card = `
    <div class="card">
      <img src="${gif.images.original.url}">
    </div>
  `;
      gallery.innerHTML += card;
    }

    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      const query = searchField.value;

      if (query !== '') {
        search(query).then(gifData => {
          gifData = gifData.data;
          gifData.forEach(gif => {
            console.log(gif);
            createGif(gif);
          });
        });
      }
    });

}());
//# sourceMappingURL=giphy.js.map
