/* Zenith invites settings. The only file you ever need to edit. */
window.ZF_INVITES = {
  /* Paste your Apps Script web app URL between the quotes (ends in /exec) */
  api: 'https://script.google.com/macros/s/AKfycbxZ4uSZFDp7jWerISzfxDsa1BQ7xON2E-E_tjBh_j_zQWwwspxl27TWAhKpMxQa3H1X/exec',
  /* Transformation graphics for the Accelerator results strip.
     Drop the images into the invite/results folder, then list the file names here.
     IMPORTANT: images must be square (1:1). The strip crops anything that isn't.
     Leave the list empty and that section stays hidden. */
  /* Optional. Paste a Formspree form URL between the quotes and the 2 answers people
     type on the Accelerator invite (why now, what will you do when it gets hard) get
     emailed to you when they tap pay. Leave it empty and nothing is sent anywhere. */
  answers: '',
  results: [
    'kaylee-before-after.png',
    'jess.png',
    'jayne.png',
    'caroline-adrian.png',
    'glyn.png',
    'dan.png'
  ]
};
