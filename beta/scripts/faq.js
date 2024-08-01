const faqContainer = document.getElementById('faq-container');
const loadingDiv = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');

// Fetch the FAQ data and categories from the JSON files
Promise.all([
  fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json//FAQ/faq.json'),
  fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/FAQ/categories.json')
])
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then(([faqData, categoriesData]) => {
    // Hide loading spinner
    loadingDiv.style.display = 'none';

    // Generate category containers dynamically
    categoriesData.forEach(category => {
      const categoryHeading = document.createElement('h2');
      categoryHeading.textContent = category;

      const arrowIcon = document.createElement('i');
      arrowIcon.classList.add('fas', 'fa-chevron-down');
      categoryHeading.appendChild(arrowIcon);

      const categoryContainer = document.createElement('div');
      categoryContainer.id = category.toLowerCase().replace(/\s+/g, '-');
      categoryContainer.style.display = 'none';

      faqContainer.appendChild(categoryHeading);
      faqContainer.appendChild(categoryContainer);

      // Add click event listener to toggle category visibility
      categoryHeading.addEventListener('click', () => {
        categoryContainer.style.display = categoryContainer.style.display === 'none' ? 'block' : 'none';
        categoryHeading.classList.toggle('expanded');
        arrowIcon.classList.toggle('fa-chevron-down');
        arrowIcon.classList.toggle('fa-chevron-up');
      });
    });

    // Group FAQ items by category
    const categories = {};
    categoriesData.forEach(category => {
      categories[category] = [];
    });

    faqData.forEach(faq => {
      categories[faq.category].push(faq);
    });

    // Generate FAQ elements dynamically for each category
    Object.entries(categories).forEach(([category, faqs]) => {
      const categoryContainer = document.getElementById(`${category.toLowerCase().replace(/\s+/g, '-')}`);

      faqs.forEach(faq => {
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

        categoryContainer.appendChild(faqElement);
      });
    });

    // Show FAQ container
    faqContainer.style.display = 'block';
  })
  .catch(error => {
    console.error('Error:', error);
    displayErrorMessage('Failed to load FAQ data. Please try again later.');
  });

function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
}

retryButton.addEventListener('click', () => {
  location.reload();
});
