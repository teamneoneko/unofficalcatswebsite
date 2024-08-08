const versionSelect = document.getElementById('version-select');
const resultDiv = document.getElementById('result');
const themeToggle = document.getElementById('theme-toggle');
const loadingDiv = document.getElementById('loading');

// Check if theme preference exists in local storage
const savedThemePreference = localStorage.getItem('themePreference');
if (savedThemePreference === 'light-mode') {
  document.body.classList.add('light-mode');
  themeToggle.checked = true;
}

// Fetch the list of JSON files from the 'versions.json' file on GitHub
fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/versions.json')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch versions.json');
    }
  })
  .then(files => {
    // Show loading spinner
    loadingDiv.style.display = 'block';

    // Sort versions in descending order
    files.sort().reverse();

    const promises = files.map(file => {
      return fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${file}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Failed to fetch ${file}`);
          }
        });
    });

    Promise.all(promises)
      .then(dataArray => {
        dataArray.forEach((data, index) => {
          const option = document.createElement('option');
          option.value = files[index];
          option.textContent = data.version;
          versionSelect.appendChild(option);
        });

        // Hide loading spinner
        loadingDiv.style.display = 'none';
      })
      .catch(error => {
        console.error('Error:', error);
        // Hide loading spinner and display error message
        loadingDiv.style.display = 'none';
        displayErrorMessage('Failed to load version information. Please try again later.');
      });
  })
  .catch(error => {
    console.error('Error:', error);
    // Hide loading spinner and display error message
    loadingDiv.style.display = 'none';
    displayErrorMessage('Failed to load version information. Please try again later.');
  });

versionSelect.addEventListener('change', function() {
  const selectedVersion = this.value;
  
  if (selectedVersion) {
    // Show loading spinner
    loadingDiv.style.display = 'block';

    fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${selectedVersion}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch version JSON file');
        }
      })
      .then(data => {
        // Hide loading spinner and display result
        loadingDiv.style.display = 'none';
        resultDiv.querySelector('p').textContent = data.description;
        
        document.getElementById('latest-version').textContent = data.latestVersion || 'N/A';
        document.getElementById('release-date').textContent = data.releaseDate || 'N/A';
        document.getElementById('eol-date').textContent = data.eolDate || 'N/A';
        
        const archiveLink = document.getElementById('archive-link');
        archiveLink.style.display = data.archiveLink ? 'inline-block' : 'none';
        if (data.archiveLink) archiveLink.href = data.archiveLink;
        
        if (data.unofficial) {
          const unofficialSection = document.getElementById('unofficial-section');
          const unofficialGithubLink = document.getElementById('unofficial-github-link');
          const unofficialWikiLink = document.getElementById('unofficial-wiki-link');
          const unofficialDiscordLink = document.getElementById('unofficial-discord-link');
          const unofficialDownloadLink = document.getElementById('unofficial-download-link');
          
          unofficialGithubLink.style.display = data.unofficial.githubLink ? 'inline-block' : 'none';
          unofficialWikiLink.style.display = data.unofficial.wikiLink ? 'inline-block' : 'none';
          unofficialDiscordLink.style.display = data.unofficial.discordLink ? 'inline-block' : 'none';
          unofficialDownloadLink.style.display = data.unofficial.downloadLink ? 'inline-block' : 'none';
          
          if (data.unofficial.githubLink) unofficialGithubLink.href = data.unofficial.githubLink;
          if (data.unofficial.wikiLink) unofficialWikiLink.href = data.unofficial.wikiLink;
          if (data.unofficial.discordLink) unofficialDiscordLink.href = data.unofficial.discordLink;
          if (data.unofficial.downloadLink) unofficialDownloadLink.href = data.unofficial.downloadLink;
          
          unofficialSection.style.display = 'block';
        } else {
          document.getElementById('unofficial-section').style.display = 'none';
        }
        
        if (data.official) {
          const officialSection = document.getElementById('official-section');
          const officialGithubLink = document.getElementById('official-github-link');
          const officialWikiLink = document.getElementById('official-wiki-link');
          const officialDiscordLink = document.getElementById('official-discord-link');
          const officialDownloadLink = document.getElementById('official-download-link');
          
          officialGithubLink.style.display = data.official.githubLink ? 'inline-block' : 'none';
          officialWikiLink.style.display = data.official.wikiLink ? 'inline-block' : 'none';
          officialDiscordLink.style.display = data.official.discordLink ? 'inline-block' : 'none';
          officialDownloadLink.style.display = data.official.downloadLink ? 'inline-block' : 'none';
          
          if (data.official.githubLink) officialGithubLink.href = data.official.githubLink;
          if (data.official.wikiLink) officialWikiLink.href = data.official.wikiLink;
          if (data.official.discordLink) officialDiscordLink.href = data.official.discordLink;
          if (data.official.downloadLink) officialDownloadLink.href = data.official.downloadLink;
          
          officialSection.style.display = 'block';
        } else {
          document.getElementById('official-section').style.display = 'none';
        }
        
        resultDiv.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        // Hide loading spinner and display error message
        loadingDiv.style.display = 'none';
        displayErrorMessage('Failed to load version information. Please try again later.');
      });
  } else {
    // Hide loading spinner and result div
    loadingDiv.style.display = 'none';
    resultDiv.style.display = 'none';
  }
});

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
  resultDiv.innerHTML = `
    <p>${message}</p>
    <button id="retryButton" class="button">Retry</button>
  `;
  resultDiv.style.display = 'block';

  const retryButton = document.getElementById('retryButton');
  retryButton.addEventListener('click', () => {
    location.reload();
  });
}

