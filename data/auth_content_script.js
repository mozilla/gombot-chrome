window.addEventListener('login-success', function() {
    alert('login-success');
});// 
// window.__authSuccess = function(data) {
//     alert('login-success');
//     chrome.extension.sendMessage({
//         type: 'login_success',
//         message: {
//             email: data.email
//         }
//     });
// };
// 
