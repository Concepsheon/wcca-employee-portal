function handleSignIn() {
    
    // Validate email field is in xxx@xxx.com format
    var regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    
    var email = $("#email").val();
    var password = $("#password").val();
    
    if(email !== "" && regex.test(email)) {
        if(password !== "") {
            firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(err){
                $(".alert-danger").removeClass("hidden");
                console.log('Login failed ' + err.message);
            });
        }
        
    } else {
        alert("Please enter a valid email address");
    }
    
    $(".alert-danger").addClass("hidden");
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
}

window.onload = function() {
    init();
};