// Firebase references
var announcements = firebase.database().ref("announcements");
var uploads = firebase.database().ref("uploads");
var jobs = firebase.database().ref("jobs");

// Handle logout
function handleSignOut() {
    firebase.auth().signOut();
    console.log("Successfully logged out");
    window.location = "index.html";
}

// Add announcements
function announcement() {
    var title = $("#title").val();
    var message = $("#message").val();
    
    if(title == "" || message == "") {
        return false;
    }
    
    announcements.push({
        "title": title,
        "message": message
    });
    
    $(".alert-success").show();
    
    $("#title").val("");
    $("#message").val("");
}


// Add jobs
function job() {
    var title = $("#jobTitle").val();
    var description = $("#jobDescription").val();
    
    if(title == "" || description == "") {
        return false;
    }
    
    jobs.push({
        "title": title,
        "descriptions": description,
    });
    
    $(".alert-success").show();
    
    // Reset form
    $("#jobTitle").val("");
    $("#jobDescription").val("");
}


// File upload
function uploadFile(e) {
    var bar = document.getElementById("progressbar");
    // Get file
    var file = e.target.files[0];
    
    // Storage reference
    var wccaCloud = firebase.storage().ref("wcca/" + file.name);
    
    // Upload
    var upload = wccaCloud.put(file);
    
    // Show progress
    upload.on("state_changed", function progress(snap){
        var percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
        bar.value = percentage;
      },
      
      function error(err) {
        alert("Failed to upload file " + err.message);
        console.log(err.message);
      },
      
      function complete() {
          
        // Add file to db after upload is complete
        var uniqueKey = firebase.database().ref('uploads/').push().key;
        var downloadURL = upload.snapshot.downloadURL;
        
        var updates = {};
        
        var uploadData = {
          url: downloadURL,
          name: file.name
        };
        
        updates['/uploads/'+ uniqueKey] = uploadData;
        firebase.database().ref().update(updates);
        
        console.log("Upload Complete " + file.name);
      }
    );
}

function init() {
    // Listen for auth changes
    firebase.auth().onAuthStateChanged(user => {
        if(user) {
            $(".username").text(user.email);
            
            // Access based on user role
            if(user.uid) {
                if(user.uid === "ADer5kHfQXhWklAsh4JD7X4s60K2" || user.uid === "ENDok6TGTHRECmsVOMPPWr6mWMZ2") {
                    $(".admin-access").show();
                    $("#user-uid").text("HR")
                } else if(user.uid === "fCfJltTxY6R4eyZj1YWeP408B172") {
                    $("#user-uid").text("Admin");
                    $(".admin-access").show();
                } else {
                    $("#user-uid").text("ID: " + user.uid.slice(0, 20));
                    $(".admin-access").hide();
                }
            }
            
        } else {
            window.location = "index.html";
            console.log("Log in required.");
        }
    });
    
    $("#announcements-submit").click(announcement);
    $("#logout").click(handleSignOut);
    $("#job-submit").click(job);
    
    // File upload
    $(".file-upload-input").on("change", uploadFile);
    
    // Button trigger file upload
    $(".file-upload-btn").click(function() {
        $('.file-upload-input').trigger( 'click' );
    });
    
    
    // Display all announcements
    announcements.on("value", function(snap) {
        var data = "";
        snap.forEach(function(child) {
            data += '<div class="serviceBox"><div class="service-icon"><a href="#"><span><i class="glyphicon glyphicon-bullhorn"></i></span></a></div><div class="service-content"><h3>' + child.val().title + '</h3><p>' + child.val().message + '</p></div></div>';
        });
        
        $("#announcements-list").html(data);
    });
    
    // Display all uploads
    uploads.on("value", function(snap) {
        var data = "";
        snap.forEach(function(child) {
            data += '<li><i class="glyphicon glyphicon-unchecked"></i><span><a target="_blank" href="'+ child.val().url +'">' + child.val().name +'</a></span></div></li>';
        });
        
        $("#documents-list").html(data);
    });
    
    // Display all jobs
    jobs.on("value", function(snap) {
        var data = "";
        snap.forEach(function(child) {
            data = '<div class="serviceBox2"><div class="service-icon"><i class="glyphicon glyphicon-briefcase"></i></div><h3 class="title">' + child.val().title + '</h3><p class="description">' + child.val().descriptions + '</p></div>';
        });
        $("#jobs-list").html(data);
    });
}

window.onload = function() {
    init();
};