const faqContainer = document.getElementById('faq-container');
const loadingDiv = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');

// Check if theme preference exists in local storage
const savedThemePreference = localStorage.getItem('themePreference');
if (savedThemePreference === 'light-mode') {
  document.body.classList.add('light-mode');
  themeToggle.checked = true;
}

// Fetch the FAQ data from the JSON file
fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/faq.json')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch faq.json');
    }
  })
  .then(data => {
    // Hide loading spinner
    loadingDiv.style.display = 'none';
    
    // Generate FAQ elements dynamically
    data.forEach(faq => {
      const faqElement = document.createElement('div');
      faqElement.classList.add('faq-item');
      
      const questionElement = document.createElement('h3');
      questionElement.textContent = faq.question;
      
      const arrowIcon = document.createElement('i');
      arrowIcon.classList.add('fas', 'fa-chevron-down');
      questionElement.appendChild(arrowIcon);
      
      faqElement.appendChild(questionElement);
      
      const answerElement = document.createElement('p');
      answerElement.innerHTML = faq.answer.replace(/\n/g, '<br>');
      answerElement.style.display = 'none';
      faqElement.appendChild(answerElement);
      
      // Add click event listener to toggle answer visibility
      questionElement.addEventListener('click', () => {
        answerElement.style.display = answerElement.style.display === 'none' ? 'block' : 'none';
        faqElement.classList.toggle('expanded');
        arrowIcon.classList.toggle('fa-chevron-down');
        arrowIcon.classList.toggle('fa-chevron-up');
      });      
      
      faqContainer.appendChild(faqElement);
    });
    
    // Show FAQ container
    faqContainer.style.display = 'block';
  })

themeToggle.addEventListener('change', function() {
  document.body.classList.toggle('light-mode');
  
  // Save theme preference to local storage
  if (document.body.classList.contains('light-mode')) {
    localStorage.setItem('themePreference', 'light-mode');
  } else {
    localStorage.setItem('themePreference', 'dark-mode');
  }
});

function displayErrorMessage(message) {
  faqContainer.innerHTML = `
    <p>${message}</p>
    <button id="retryButton" class="button">Retry</button>
  `;
  faqContainer.style.display = 'block';

  const retryButton = document.getElementById('retryButton');
  retryButton.addEventListener('click', () => {
    location.reload();
  });
}
