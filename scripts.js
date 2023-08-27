function showTab(tabId) {
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabId);
    selectedTab.style.display = 'block';

    if (tabId === 'about' && !bioDisplayed) {
        const bio = document.getElementById('about');
        const children = Array.from(bio.children);
        children.forEach((child) => {
            child.style.display = 'none';
        })
        // When the about tab is clicked:
        if (!bioDisplayed) {
            displayBioContent();
            bioDisplayed = true;
        }
    }
}

let appsContentDisplayed = false;
let bioDisplayed = false;

function displayAppContent() {
    const apps = document.querySelectorAll('.app');

    let appIndex = 0;
    let childIndex = 0;

    function displayNextChild() {
        if (appIndex < apps.length) {
            const children = Array.from(apps[appIndex].children);  // Get all child elements of the current app

            if (childIndex < children.length) {
                const child = children[childIndex];

                // Now, type content for each child
                typeContent(child, () => {
                    childIndex++;
                    displayNextChild();
                });

            } else {  // If there are no more child elements, move to the next app
                appIndex++;
                childIndex = 0;  // Reset child index for the new app
                displayNextChild();
            }
        }
    }

    displayNextChild();
}

function displayBioContent() {
    const apps = document.querySelectorAll('#about');

    let appIndex = 0;
    let childIndex = 0;

    function displayNextChild() {
        if (appIndex < apps.length) {
            const children = Array.from(apps[appIndex].children);  // Get all child elements of the current app

            if (childIndex < children.length) {
                const child = children[childIndex];

                // Now, type content for each child
                typeContent(child, () => {
                    childIndex++;
                    displayNextChild();
                });

            } else {  // If there are no more child elements, move to the next app
                appIndex++;
                childIndex = 0;  // Reset child index for the new app
                displayNextChild();
            }
        }
    }

    displayNextChild();
}


function typeContent(container, callback) {
    let currentElement = container.cloneNode(true);
    const buffer = document.createElement('div');
    buffer.style.display = 'none';
    document.body.appendChild(buffer);

    container.innerHTML = '';
    container.style.display = 'block';

    // Create and append cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    container.appendChild(cursor);

    let currentIndex = 0;
    const speed = 5;

    function type() {
        if (currentIndex < currentElement.innerHTML.length) {
            buffer.innerHTML = currentElement.innerHTML.substring(0, currentIndex);            
            container.textContent = buffer.innerHTML;
            container.appendChild(cursor);  // Ensure the cursor is always at the end
            
            currentIndex++;
            setTimeout(type, speed);
        } else {
            container.innerHTML = currentElement.innerHTML;
            document.body.removeChild(buffer);
            if (callback) callback();
        }
    }

    type();
}

// When the apps tab is clicked:
if (!appsContentDisplayed) {
    displayAppContent();
    appsContentDisplayed = true;
}