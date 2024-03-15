
function fetchRandomActivity() {
    fetch('http://www.boredapi.com/api/activity/')
        .then(response => response.json())
        .then(data => {
            const activityElement = document.getElementById('randomActivity');
            if (data && data.activity) {
                activityElement.textContent = data.activity;
            } else {
                activityElement.textContent = 'Sorry, failed to fetch a fun activity.';
            }
        })
        .catch(error => {
            console.error('Error fetching random activity:', error);
            document.getElementById('randomActivity').textContent = 'Sorry, failed to fetch a fun activity.';
        });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchRandomActivity);
