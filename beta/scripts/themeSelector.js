document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    const themeStylesheet = document.createElement('link');
    themeStylesheet.rel = 'stylesheet';
    document.head.appendChild(themeStylesheet);
  
    function setTheme(theme) {
      if (theme === 'default') {
        themeStylesheet.href = '';
      } else {
        themeStylesheet.href = `../beta/css/themes/${theme}-theme.css`;
      }
      localStorage.setItem('selectedTheme', theme);
      
      // Update the selected option based on the data-theme attribute
      const selectedOption = themeSelect.querySelector(`[data-theme="${theme}"]`);
      if (selectedOption) {
        selectedOption.selected = true;
      }
    }
  
    themeSelect.addEventListener('change', (e) => {
      setTheme(e.target.selectedOptions[0].getAttribute('data-theme'));
    });
  
    // Load saved theme or set default theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('default');
    }
});
