const { JSDOM } = require('jsdom');

// Function to get the "joinlobby" link from a Steam profile page
async function getJoinLobbyLink(profileName) {
    try {
        // Construct the URL of the web page using the Steam profile name
        const url = `https://steamjoin.com/${profileName}?noredirect`;

        // Use the fetch method to get the HTML content of the page
        const response = await fetch(url);
        const html = await response.text();

        // Use JSDOM to parse the HTML content
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Find all the <a> tags on the page
        const anchorElements = document.querySelectorAll('a');

        // Iterate through all <a> tags and find the one containing "joinlobby"
        let joinLobbyLink = null;
        for (const anchorElement of anchorElements) {
            const href = anchorElement.getAttribute('href');
            if (href && href.includes('joinlobby')) {
                joinLobbyLink = href;
                break; // Stop searching once we've found the link
            }
        }

        if (joinLobbyLink) {
            return joinLobbyLink;
        } else {
            throw new Error('No "joinlobby" link was found on the page.');
        }
    } catch (error) {
        throw new Error(`Error while retrieving the web page: ${error.message}`);
    }
}

module.exports = { getJoinLobbyLink };