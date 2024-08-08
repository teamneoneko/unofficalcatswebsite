document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const menu = document.querySelector('.menu');
    const mobileMenu = document.createElement('div');
    mobileMenu.classList.add('mobile-menu');

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('mobile-menu-close');
    closeButton.innerHTML = '&times;';
    mobileMenu.appendChild(closeButton);

    // Clone the existing menu items into the mobile menu
    menu.querySelectorAll('li:not(.theme-selector)').forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const newLink = link.cloneNode(true);
            mobileMenu.appendChild(newLink);
        }
    });

    // Add theme selector to the bottom of the mobile menu
    const themeSelector = document.querySelector('.theme-selector').cloneNode(true);
    themeSelector.classList.remove('theme-selector');
    themeSelector.classList.add('mobile-theme-selector');
    mobileMenu.appendChild(themeSelector);

    // Append the mobile menu to the body
    document.body.appendChild(mobileMenu);

    // Reinitialize the theme selector
    const mobileThemeSelect = mobileMenu.querySelector('.mobile-theme-selector select');
    if (mobileThemeSelect) {
        mobileThemeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.selectedOptions[0].getAttribute('data-theme');
            setTheme(selectedTheme);
        });
    }

    // Toggle the mobile menu on button click
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
    
    closeButton.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });    
});
