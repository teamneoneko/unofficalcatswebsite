class VersionSelector {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentDownloadUrl = null;
        this.currentType = null;
    }

    initializeElements() {
        this.officialSelector = document.getElementById('official-selector');
        this.unofficialSelector = document.getElementById('unofficial-selector');
        this.backButton = document.getElementById('back-button');
        this.typeSelector = document.querySelector('.cats-type-selector');
        this.versionSelector = document.querySelector('.version-selector');
        this.select = document.getElementById('blender-version-select');
        this.downloadButton = document.getElementById('download-button');
        this.modal = document.getElementById('unofficial-warning');
        this.modalCloseButton = document.querySelector('.modal-close');
        this.proceedButton = document.getElementById('proceed-download');
        this.latestVersion = document.getElementById('latest-version');
        this.developmentStatus = document.getElementById('development-status');
        this.releaseDate = document.getElementById('release-date');
        this.eolDate = document.getElementById('eol-date');
        this.description = document.getElementById('version-description');
        this.resultContainer = document.querySelector('.result-container');
    }

    bindEvents() {
        this.officialSelector.addEventListener('click', () => this.showVersionSelector('official'));
        this.unofficialSelector.addEventListener('click', () => this.showVersionSelector('unofficial'));
        this.backButton.addEventListener('click', () => this.showTypeSelector());
        this.select.addEventListener('change', () => this.handleVersionChange());
        this.downloadButton.addEventListener('click', () => this.handleDownload());
        this.proceedButton.addEventListener('click', () => this.proceedWithDownload());
        this.modalCloseButton.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    showVersionSelector(type) {
        this.currentType = type;
        this.typeSelector.style.display = 'none';
        this.versionSelector.style.display = 'block';
        this.backButton.style.display = 'block';
        this.resultContainer.style.display = 'none';
        this.loadVersions(type);
    }

    showTypeSelector() {
        this.typeSelector.style.display = 'flex';
        this.versionSelector.style.display = 'none';
        this.backButton.style.display = 'none';
        this.resultContainer.style.display = 'none';
    }

    async loadVersions(type) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        this.select.parentNode.appendChild(loadingDiv);

        try {
            const response = await fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/data/BlenderVersions/versions.json');
            const files = await response.json();
            files.sort().reverse();

            const promises = files.map(file => 
                fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/data/BlenderVersions/${file}`)
                    .then(response => response.json())
            );

            const dataArray = await Promise.all(promises);
            this.populateVersionSelect(dataArray, files, type === 'unofficial');
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            loadingDiv.remove();
        }
    }

    populateVersionSelect(dataArray, files, isUnofficial) {
        this.select.innerHTML = '<option value="">Choose your Blender version</option>';
        
        dataArray.forEach((data, index) => {
            if ((isUnofficial && data.unofficial) || (!isUnofficial && data.official)) {
                const option = document.createElement('option');
                option.value = files[index];
                option.textContent = `Blender ${data.version}`;
                this.select.appendChild(option);
            }
        });

        this.downloadButton.disabled = true;
        this.resetDisplayFields();
    }

    resetDisplayFields() {
        this.latestVersion.textContent = '-';
        this.developmentStatus.textContent = '-';
        this.releaseDate.textContent = '-';
        this.eolDate.textContent = '-';
        this.description.innerHTML = '';
        this.resultContainer.style.display = 'none';
    }

    async handleVersionChange() {
        const selectedFile = this.select.value;
        if (!selectedFile) {
            this.downloadButton.disabled = true;
            this.resultContainer.style.display = 'none';
            return;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        this.select.parentNode.appendChild(loadingDiv);

        try {
            const response = await fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/data/BlenderVersions/${selectedFile}`);
            const data = await response.json();
            
            const versionData = this.currentType === 'unofficial' ? data.unofficial : data.official;

            this.latestVersion.textContent = data.latestVersion || 'N/A';
            this.developmentStatus.textContent = data.developmentStatus || 'N/A';
            this.releaseDate.textContent = data.releaseDate || 'N/A';
            this.eolDate.textContent = data.eolDate || 'N/A';
            this.description.innerHTML = data.description || '';

            const links = {
                'github-link': versionData?.githubLink,
                'download-link': versionData?.downloadLink,
                'wiki-link': versionData?.wikiLink,
                'discord-link': versionData?.discordLink,
                'archive-link': data.archiveLink
            };

            let hasSupport = false;
            Object.entries(links).forEach(([id, url]) => {
                const element = document.getElementById(id);
                if (element && url) {
                    element.href = url;
                    element.style.display = 'inline-block';
                    if (id === 'wiki-link' || id === 'discord-link') {
                        hasSupport = true;
                    }
                } else if (element) {
                    element.style.display = 'none';
                }
            });

            const unsupportedMessage = document.getElementById('unsupported-message');
            unsupportedMessage.style.display = hasSupport ? 'none' : 'block';

            this.currentDownloadUrl = versionData?.downloadLink || null;
            this.downloadButton.disabled = !this.currentDownloadUrl;
            this.resultContainer.style.display = 'block';
        } catch (error) {
            console.error('Error loading version details:', error);
            this.downloadButton.disabled = true;
            this.resultContainer.style.display = 'none';
        } finally {
            loadingDiv.remove();
        }
    }

    handleDownload() {
        if (this.currentType === 'unofficial') {
            this.modal.style.display = 'block';
        } else {
            this.proceedWithDownload();
        }
    }

    proceedWithDownload() {
        if (this.currentDownloadUrl) {
            window.location.href = this.currentDownloadUrl;
        }
        this.closeModal();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VersionSelector();
});
