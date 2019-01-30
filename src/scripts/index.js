'use strict';

import '../styles/index.scss';

import giphy from './giphy';

const searchField = document.querySelector('.search__field');
const searchForm = document.forms.namedItem('search');

const gallery = document.querySelector('.gallery');

function createGif(gif) {
  const card = `
    <div class="card">
      <img src="${gif.images.original.url}">
    </div>
  `
  gallery.innerHTML += card;
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchField.value;

  if (query !== '') {
    giphy(query).then(gifData => {
      gifData = gifData.data;

      gifData.forEach(gif => {
        console.log(gif)
        createGif(gif)
      })
    });
  } else {

  }
})
