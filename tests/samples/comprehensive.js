// Comprehensive test file showcasing all legacy patterns
var config = {
  apiUrl: 'https://api.example.com'
};

function fetchUserData(userId) {
  // Legacy AJAX
  var xhr = new XMLHttpRequest();
  xhr.open('GET', config.apiUrl + '/users/' + userId);
  xhr.send();
  
  // Legacy Promise constructor
  return new Promise((resolve, reject) => {
    xhr.onload = function() {
      if (xhr.status == 200) {
        var data = xhr.responseText;
        document.getElementById('result').innerHTML = data;
        resolve(data);
      }
    };
  });
}

var userName = 'admin';
var userList = ['alice', 'bob', 'charlie'];

// Legacy equality and array methods
if (userName == 'admin') {
  if (userList.indexOf('alice') > -1) {
    var elements = document.getElementsByClassName('user-item');
    var divs = document.getElementsByTagName('div');
    
    // String concatenation
    var message = 'Hello ' + userName + ', you have ' + userList.length + ' users';
    
    // Unsafe innerHTML
    elements[0].innerHTML = message;
    
    // User agent sniffing
    if (navigator.userAgent.indexOf('Chrome') > -1) {
      console.log('Chrome detected');
    }
  }
}

// Legacy event handling (would work in old IE)
if (document.attachEvent) {
  document.attachEvent('onclick', function() {
    alert('Legacy event!');
  });
}

// Deprecated with statement
with (config) {
  console.log('API URL: ' + apiUrl);
}

// Legacy Array.apply for converting NodeList to Array
var nodeList = document.getElementsByTagName('div');
var nodeArray = Array.apply(null, nodeList);
console.log('Converted NodeList to Array:', nodeArray);
