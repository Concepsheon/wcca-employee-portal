function handleSignIn() {
    
    // Validate email field is in xxx@xxx.com format
    var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    
    var email = $("#email").val();
    var password = $("#password").val();
    
    if(email !== "" && regex.test(email)) {
        if(password !== "") {
            firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(err){
                toastr.error('Login failed. Wrong email or password.');
                console.log('Login failed ' + err.message);
            });
        }
        
    } else {
       toastr.error('Please enter a valid email address');
    }
}

function handleUserRegister() {
    
    // Validate email field is in xxx@xxx.com format
    var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    
    var email = $("#emailRegister").val();
    var password = $("#passwordRegister").val();
    
    if(email !== "" && regex.test(email)) {
        if(password !== "") {
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .catch(function(err){
                toastr.error('Login failed. Email is already in use.');
                console.log('Failed to register user ' + err.message);
            });
        }
        
    } else {
        toastr.error('Please enter a valid email address');
    }
}

function init() {
    // Listen for auth changes
    firebase.auth().onAuthStateChanged(user => {
        if(user) {
            window.location = "home.html";
            
        } else {
            console.log("Please log in.");
        }
    });
    
    $("#login").click(handleSignIn);
    $("#register").click(handleUserRegister);
}

window.onload = function() {
    init();
};