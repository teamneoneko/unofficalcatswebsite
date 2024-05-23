const versionSelect = document.getElementById('version-select');
const resultDiv = document.getElementById('result');
const themeToggle = document.getElementById('theme-toggle');

// Fetch the list of JSON files from the 'versions.json' file
fetch('./json/versions.json')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch versions.json');
    }
  })
  .then(files => {
    files.forEach(file => {
      // Fetch the JSON file to get the version field
      fetch(`./json/${file}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Failed to fetch ${file}`);
          }
        })
        .then(data => {
          // Create an <option> element for each JSON file using the version field
          const option = document.createElement('option');
          option.value = file;
          option.textContent = data.version;
          versionSelect.appendChild(option);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle the error, display an error message, etc.
    resultDiv.innerHTML = '<p>Failed to load version information. Please try again later.</p>';
    resultDiv.style.display = 'block';
  });

versionSelect.addEventListener('change', function() {
  const selectedVersion = this.value;
  
  if (selectedVersion) {
    fetch(`./json/${selectedVersion}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch version JSON file');
        }
      })
      .then(data => {
        resultDiv.querySelector('p').textContent = data.description;
        
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
        resultDiv.innerHTML = '<p>Failed to load version information. Please try again later.</p>';
        resultDiv.style.display = 'block';
      });
  } else {
    resultDiv.style.display = 'none';
  }
});

themeToggle.addEventListener('change', function() {
  document.body.classList.toggle('light-mode');
});
