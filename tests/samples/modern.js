// Modern Baseline-supported patterns
fetch('/api/users')
    .then(response => response.json())
    .then(data => {
        document.querySelector('#result').textContent = JSON.stringify(data);
    });

const userName = 'John';
let userAge = 25;

document.querySelector('#button').addEventListener('click', () => {
    console.log('Clicked!');
});

async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
    console.log('Timer finished');
}
