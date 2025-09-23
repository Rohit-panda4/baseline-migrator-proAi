// Legacy patterns for testing
var xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById('result').innerHTML = xhr.responseText;
    }
};
xhr.send();

var userName = 'John';
var userAge = 25;

document.getElementById('button').onclick = function() {
    alert('Clicked!');
};

setTimeout(function() {
    console.log('Timer finished');
}, 1000);
