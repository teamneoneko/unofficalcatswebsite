document.addEventListener('DOMContentLoaded', () => {
    const maintenanceMode = true; // Set this to true to enable maintenance mode
    const maintenanceDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    if (maintenanceMode) {
        const maintenancePopup = document.createElement('div');
        maintenancePopup.classList.add('maintenance-popup');
        maintenancePopup.innerHTML = `
            <div class="maintenance-content">
                <h2>Site Maintenance</h2>
                <p>We're enhancing our server infrastructure to prepare for an exciting new site launch. Stay tuned for an improved experience coming soon!</p>
                <div id="countdown"></div>
            </div>
        `;
        document.body.appendChild(maintenancePopup);
        document.body.classList.add('maintenance-active');

        function getUKTime() {
            const now = new Date();
            const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
            return ukTime;
        }

        const ukNow = getUKTime();
        const startTime = new Date(ukNow.getFullYear(), ukNow.getMonth(), ukNow.getDate(), 23, 40, 0);
        const endTime = new Date(startTime.getTime() + maintenanceDuration);

        const countdownElement = document.getElementById('countdown');

        function updateCountdown() {
            const ukNow = getUKTime();
            const timeLeft = Math.max(0, Math.floor((endTime - ukNow) / 1000));
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            countdownElement.textContent = `Estimated time remaining: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft > 0) {
                requestAnimationFrame(updateCountdown);
            } else {
                countdownElement.textContent = 'Maintenance should be completed. Please refresh the page.';
            }
        }

        updateCountdown();
    }
});
