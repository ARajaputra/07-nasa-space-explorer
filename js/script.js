// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const submitButton = document.getElementById('submitButton');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('status');
const imageDialog = document.getElementById('imageDialog');
const dialogImage = document.getElementById('dialogImage');
const dialogDate = document.getElementById('dialogDate');
const dialogTitle = document.getElementById('dialogTitle');
const dialogExplanation = document.getElementById('dialogExplanation');

const spaceFacts = [
	'A day on Venus is longer than its year.',
	'Neutron stars can spin about 600 times per second.',
	'There are more stars in the universe than grains of sand on Earth.',
	'Saturn would float in water because it is less dense than water.',
	'The footprints left by Apollo astronauts can last for millions of years.'
];

document.getElementById('spaceFact').textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

dateForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	if (startInput.value > endInput.value) {
		statusMessage.textContent = 'The start date must be on or before the end date.';
		gallery.replaceChildren();
		return;
	}

	const query = new URLSearchParams({
		start_date: startInput.value,
		end_date: endInput.value,
		api_key: 'DEMO_KEY'
	});

	submitButton.disabled = true;
	statusMessage.textContent = 'Loading space photos...';
	gallery.replaceChildren();

	try {
		const response = await fetch(`https://api.nasa.gov/planetary/apod?${query}`);
		if (!response.ok) {
			throw new Error('NASA APOD request failed. Please try again in a moment.');
		}

		const entries = await response.json();
		const items = Array.isArray(entries) ? entries : [entries];
		items.forEach((item) => gallery.appendChild(createGalleryItem(item)));
		statusMessage.textContent = items.length ? `${items.length} APOD ${items.length === 1 ? 'entry' : 'entries'} found.` : 'No APOD entries were found for these dates.';
	} catch (error) {
		statusMessage.textContent = error.message || 'Unable to load space images. Check your connection and try again.';
	} finally {
		submitButton.disabled = false;
	}
});

function createGalleryItem(item) {
	const card = document.createElement('article');
	card.className = 'gallery-item';

	if (item.media_type === 'image') {
		const imageButton = document.createElement('button');
		imageButton.className = 'image-button';
		imageButton.type = 'button';
		imageButton.setAttribute('aria-label', `View ${item.title}, ${item.date}`);

		const image = document.createElement('img');
		image.src = item.url;
		image.alt = item.title;
		imageButton.appendChild(image);
		imageButton.addEventListener('click', () => openImageDetails(item));
		card.appendChild(imageButton);
	} else {
		const videoLabel = document.createElement('p');
		videoLabel.className = 'video-label';
		videoLabel.textContent = 'VIDEO';
		card.appendChild(videoLabel);
	}

	const cardCopy = document.createElement('div');
	cardCopy.className = 'card-copy';
	const date = document.createElement('p');
	date.className = 'card-date';
	date.textContent = item.date;
	const title = document.createElement('h2');
	title.textContent = item.title;
	cardCopy.append(date, title);
	card.appendChild(cardCopy);

	if (item.media_type !== 'image') {
		const videoLink = document.createElement('a');
		videoLink.className = 'video-link';
		videoLink.href = item.url;
		videoLink.target = '_blank';
		videoLink.rel = 'noopener noreferrer';
		videoLink.textContent = 'Watch this APOD video';
		card.appendChild(videoLink);
	}

	return card;
}

function openImageDetails(item) {
	dialogImage.src = item.hdurl || item.url;
	dialogImage.alt = item.title;
	dialogDate.textContent = item.date;
	dialogTitle.textContent = item.title;
	dialogExplanation.textContent = item.explanation;
	imageDialog.showModal();
}

document.getElementById('closeDialog').addEventListener('click', () => imageDialog.close());

imageDialog.addEventListener('click', (event) => {
	if (event.target === imageDialog) {
		imageDialog.close();
	}
});
