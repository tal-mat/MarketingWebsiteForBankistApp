'use strict';

///////////////////////////////////////
// Elements
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const nav = document.querySelector('.nav');

const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const header = document.querySelector('.header');

///////////////////////////////////////
// Modal window
const openModal = function (e) {
  e.preventDefault(); // Preventing the default link behavior to jump to the top of the page
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

///////////////////////////////////////
// Button scrolling
btnScrollTo.addEventListener('click', function(e) {
  const s1coords = section1.getBoundingClientRect();
  section1.scrollIntoView({behavior: 'smooth'});
});

///////////////////////////////////////
// Page navigation

// Adds a smooth scroll effect to all elements with the class 'nav__link' when clicked by:
// 1. Add event listener to common parent element
// 2. Determine what element originated the event
document.querySelector('.nav__links').addEventListener('click', function (e) {
  // Prevent the original href="#section..." of the nav-link items
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
      const id = e.target.getAttribute('href');
      document.querySelector(id).scrollIntoView({behavior: 'smooth'});
  }
});

///////////////////////////////////////
// Tabbed component
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause for ignoring any click the result is a null
  if (!clicked) return;

  // Remove active classes from tabs and their content
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');
})

///////////////////////////////////////
// Menu fade animation

// A function to change the opacity of navigation links and logo by passing "argument" into the handle
const handleHover = function (e) {
  if(e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
}

// Change opacity of navigation links and logo to be lighter on mouseover
nav.addEventListener('mouseover', handleHover.bind(0.5));

// Restore opacity of navigation links and logo to original on mouseout
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////
// Sticky navigation: Intersection Observer API

const navHeight = nav.getBoundingClientRect().height;

// Function to handle the sticky navigation behavior
const stickyNav = function(entries) {
  // Getting only the first entry, that's all is needed
  const [entry] = entries;

  // Check if the header is intersecting (visible in the viewport)
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
}

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null, // Use the viewport as the root
  threshold: 0, // When 0% of the header is visible
  rootMargin: `-${navHeight}px`, // Offset the root boundary by the height of the nav
});

headerObserver.observe(header);

///////////////////////////////////////
// Reveal sections

const allSections = document.querySelectorAll('.section');

const revealSections = function(entries, observer) {
  // Getting only the first entry, that's all is needed
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  // Making animation for each section only once by deleting the observer after the first occurrence
  observer.unobserve(entry.target);
}

const sectionObserver = new IntersectionObserver
(revealSections, {
  root: null,
  threshold: 0.15,
});
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
})

///////////////////////////////////////
// Lazy loading images, so the user won't notice that, for getting better performance

// Select all images with the data-src attribute for lazy loading
const imgTarget = document.querySelectorAll('img[data-src]');

// Function to load images when they come into view
const loadImg = function (entries, observer) {
  const [entry] = entries;

  // If the image is not intersecting, do nothing
  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  // Because load the new photo is an event, then we should use event listener until it finish
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  // Remove img from the observer because we only loading it once
  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // load the images a little bit before they are in the view
});

imgTarget.forEach(img => imgObserver.observe(img));

///////////////////////////////////////
// Slider

const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions

  // Create dots for each slide and append them to the dotContainer
  const createDots = function () {
    slides.forEach(function (_, i) {
      // Adding a button element as the last child of the dotContainer for each slide
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  // Activate the dot corresponding to the current slide
  const activateDot = function (slide) {
    document.querySelectorAll('.dots__dot').forEach(dot =>
      dot.classList.remove('dots__dot--active')
    );
    // Add the active class to the dot that matches the current slide
    document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
  };

  // Move to the slide indicated by the slide parameter
  const goToSlide = function (slide) {
    slides.forEach((s, i) =>
      // Update the transform property to move slides horizontally
      s.style.transform = `translateX(${100 * (i - slide)}%)`
    );
  };

  // Move to the next slide, looping back to the start if at the end
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      // If at the last slide, go to the first slide
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Move to the previous slide, looping back to the end if at the start
  const prevSlide = function () {
    if (curSlide === 0) {
      // If at the first slide, go to the last slide
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Initialize the slider: create dots, activate the first dot, and set the initial slide position
  const initSlider = function () {
    createDots();
    activateDot(0);
    goToSlide(0);
  };

  initSlider();

  // Event handlers

  // Move to the next or previous slide when buttons are clicked
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // Move slides with keyboard arrow keys
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Move to the slide corresponding to the clicked dot
  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const slide = e.target.dataset.slide;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};

slider();
