const FORM_ENDPOINT = 'https://formspree.io/f/mkodoggq'

export function notifyWishViewed() {
  fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: 'Strgotora watched your wish 💌',
      message: 'She just opened her birthday surprise on the site. 🎂',
    }),
  }).catch((err) => console.error('Failed to send view notification', err))
}
