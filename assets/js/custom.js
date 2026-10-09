document.addEventListener("DOMContentLoaded", function () {
    const services = document.querySelectorAll(".services");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    services.forEach((service) => {
        observer.observe(service);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    cards.forEach((cards) => {
        observer.observe(cards);
    });
});


// Gallery image hover
$( ".img-wrapper" ).hover(
    function() {
      $(this).find(".img-overlay").animate({opacity: 1}, 100);
    }, function() {
      $(this).find(".img-overlay").animate({opacity: 0}, 100);
    }
  );
  
  // Lightbox
  var $overlay = $('<div id="overlay"></div>');
  var $image = $('<img alt="">');
  var $prevButton = $('<div id="prevButton"><i class="fa fa-chevron-left"></i></div>');
  var $nextButton = $('<div id="nextButton"><i class="fa fa-chevron-right"></i></div>');
  var $exitButton = $('<div id="exitButton"><i class="fa fa-times"></i></div>');
  
  // Add overlay
  $overlay.append($image).prepend($prevButton).append($nextButton).append($exitButton);
  $("#gallery").append($overlay);
  
  // Hide overlay on default
  $overlay.hide();
  
  // When an image is clicked
  $(".img-overlay").click(function(event) {
    // Prevents default behavior
    event.preventDefault();
    // Adds href attribute to variable
    var $galleryImage = $(this).prev().find("img");
    var imageLocation = $(this).prev().attr("href");
    // Add the image src to $image
    $image.attr("src", imageLocation).attr("alt", $galleryImage.attr("alt") || "Fotografija radova Euromont");
    // Fade in the overlay
    $overlay.fadeIn("fast");
  });
  
  // When the overlay is clicked
  $overlay.click(function() {
    // Fade out the overlay
    $(this).fadeOut("fast");
  });
  
  // When next button is clicked
  $nextButton.click(function(event) {
    // Hide the current image
    $("#overlay img").hide();
    // Overlay image location
    var $currentImgSrc = $("#overlay img").attr("src");
    // Image with matching location of the overlay image
    var $currentImg = $('#image-gallery img[src="' + $currentImgSrc + '"]');
    // Finds the next image
    var $nextImg = $($currentImg.closest(".image").next().find("img"));
    // All of the images in the gallery
    var $images = $("#image-gallery img");
    // If there is a next image
    if ($nextImg.length > 0) { 
      // Fade in the next image
      $image.attr("src", $nextImg.attr("src")).attr("alt", $nextImg.attr("alt") || "Fotografija radova Euromont").fadeIn(800);
    } else {
      // Otherwise fade in the first image
      var $firstImg = $($images[0]);
      $image.attr("src", $firstImg.attr("src")).attr("alt", $firstImg.attr("alt") || "Fotografija radova Euromont").fadeIn(800);
    }
    // Prevents overlay from being hidden
    event.stopPropagation();
  });
  
  // When previous button is clicked
  $prevButton.click(function(event) {
    // Hide the current image
    $("#overlay img").hide();
    // Overlay image location
    var $currentImgSrc = $("#overlay img").attr("src");
    // Image with matching location of the overlay image
    var $currentImg = $('#image-gallery img[src="' + $currentImgSrc + '"]');
    // Finds the previous image
    var $previousImg = $($currentImg.closest(".image").prev().find("img"));
    if ($previousImg.length === 0) {
      $previousImg = $("#image-gallery img").last();
    }
    // Fade in the previous image
    $image.attr("src", $previousImg.attr("src")).attr("alt", $previousImg.attr("alt") || "Fotografija radova Euromont").fadeIn(800);
    // Prevents overlay from being hidden
    event.stopPropagation();
  });
  
  // When the exit button is clicked
  $exitButton.click(function() {
    // Fade out the overlay
    $("#overlay").fadeOut("fast");
  });