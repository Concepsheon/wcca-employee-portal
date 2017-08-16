// Firebase references
var announcements = firebase.database().ref("announcements");
var uploads = firebase.database().ref("uploads");
var jobs = firebase.database().ref("jobs");
var events = firebase.database().ref("events");

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

// Add events
function event() {
    var title = $("#eventTitle").val();
    var time = $("#time").val();
    var date = $("#date").val().split("-").join(",");
    
    if(title == "" || date == "") {
        return false;
    }
    
    events.push({
        "title": title,
        "time": time,
        "date": date,
    });
    
    $(".alert-success").show();
    
    // Reset form
    $("#eventTitle").val("");
    $("#time").val("");
    $("#date").val("");
}

// Remove ref from db
function remove() {
    var key = $(this).data('key');
    if(confirm('Are you sure?')) {
        announcements.child(key).remove();
    }
}

function removeJob() {
    var key = $(this).data('key');
    if(confirm('Are you sure?')) {
        jobs.child(key).remove();
    }
}

function deleteUpload() {
    var key = $(this).data('key');
    if(confirm('Are you sure?')) {
        uploads.child(key).remove();
    }
}

function deleteEvent() {
    var key = $(this).data('key');
    if(confirm('Are you sure?')) {
        events.child(key).remove();
    }
}

// For better mobile display
function truncate(str) {
    if(str.length > 30) {
     return str.substr(0,15) + "...";   
    } else {
        return str;
    }
}

// Get date format
function getMonth(event) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(event);
    return months[date.getMonth()];
}

function getDate(event) {
    var date = new Date(event);
    return (date.getDate());
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
    $("#job-submit").click(job);
    $("#event-submit").click(event);
    
    // Log out
    $("#logout").click(handleSignOut);
    
    // File upload
    $(".file-upload-input").on("change", uploadFile);
    
    // Button trigger file upload
    $(".file-upload-btn").click(function() {
        $('.file-upload-input').trigger( 'click' );
    });
    
    // Delete functionality
    $(document).on('click', '.announcement', remove);
    $(document).on('click', '.job', removeJob);
    $(document).on('click', '.doc', deleteUpload);
    $(document).on('click', '.events', deleteEvent);
    
    // Display all announcements
    announcements.on("value", function(snap) {
        var data = "";
        var deleteData = "";
        snap.forEach(function(child) {
            data += '<div class="serviceBox"><div class="service-icon"><a href="#"><span><i class="glyphicon glyphicon-bullhorn"></i></span></a></div><div class="service-content"><h3>' + child.val().title + '</h3><p>' + child.val().message + '</p></div></div>';
            deleteData += '<li><i class="glyphicon glyphicon-bullhorn"></i><span>' + truncate(child.val().title) + '</span><div class="info"><a class="announcement button" data-key=' + child.key + '>Delete</div></a></li>';
        });
        
        $("#announcements-list").html(data);
        $("#announcement-list-delete").html(deleteData);
    });
    
    // Display all uploads
    uploads.on("value", function(snap) {
        var data = "";
        var deleteData = "";
        snap.forEach(function(child) {
            data += '<li><i class="glyphicon glyphicon-unchecked"></i><span><a target="_blank" href="'+ child.val().url +'">' + child.val().name +'</a></span></div></li>';
            deleteData += '<li><i class="glyphicon glyphicon-briefcase"></i><span>' + truncate(child.val().name) + '</span><div class="info"><a class="doc button" data-key=' + child.key + '>Delete</div></a></li>';
        });
        
        $("#documents-list").html(data);
        $("#upload-list-delete").html(deleteData);
    });
    
    // Display all jobs
    jobs.on("value", function(snap) {
        var data = "";
        var deleteData = "";
        snap.forEach(function(child) {
            data += '<div class="serviceBox2"><div class="service-icon"><i class="glyphicon glyphicon-briefcase"></i></div><h3 class="title">' + child.val().title + '</h3><p class="description">' + child.val().descriptions + '</p></div>';
            deleteData += '<li><i class="glyphicon glyphicon-briefcase"></i><span>' + truncate(child.val().title) + '</span><div class="info"><a class="job button" data-key=' + child.key + '>Delete</div></a></li>';
        });
        
        $("#jobs-list").html(data);
        $("#job-list-delete").html(deleteData);
    });
    
    // Display all events
    events.on("value", function(snap) {
        var data = "";
        var deleteData = "";
        snap.forEach(function(child) {
            data += "<li><label class='date'><span class='weekday'>" + getMonth(child.val().date) + "</span><span class='day'>" + getDate(child.val().date) + "</span></label><h3>" + child.val().title + "</h3><p><span class='duration'>" + child.val().time + "</span></p></li>";
            deleteData += '<li><i class="glyphicon glyphicon-calendar"></i><span>' + truncate(child.val().title) + '</span><div class="info"><a class="events button" data-key=' + child.key + '>Delete</div></a></li>';
        });
        
        $("#events-list").html(data);
        $("#event-list-delete").html(deleteData);
    });
}

window.onload = function() {
    init();
};