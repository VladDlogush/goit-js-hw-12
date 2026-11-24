import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const searchInput = form.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more-btn');

let currentQuery = '';
let currentPage = 1;

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

async function onFormSubmit(event) {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (query === '') {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const { hits, totalHits } = await getImagesByQuery(
      currentQuery,
      currentPage
    );

    if (hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(hits);
    form.reset();
    updateLoadMoreState(totalHits);
  } catch {
    showErrorToast();
  } finally {
    hideLoader();
  }
}

async function onLoadMoreBtnClick() {
  hideLoadMoreButton();
  showLoader();

  currentPage += 1;

  try {
    const { hits, totalHits } = await getImagesByQuery(
      currentQuery,
      currentPage
    );

    createGallery(hits);
    scrollGallery();
    updateLoadMoreState(totalHits);
  } catch {
    currentPage -= 1;
    showLoadMoreButton();
    showErrorToast();
  } finally {
    hideLoader();
  }
}

function updateLoadMoreState(totalHits) {
  const totalPages = Math.ceil(totalHits / PER_PAGE);

  if (currentPage >= totalPages) {
    hideLoadMoreButton();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
    return;
  }

  showLoadMoreButton();
}

function scrollGallery() {
  const card = document.querySelector('.gallery-item');
  if (!card) return;

  const { height } = card.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}

function showErrorToast() {
  iziToast.error({
    message: 'Something went wrong. Please try again later.',
    position: 'topRight',
  });
}
