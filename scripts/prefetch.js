function preloadImages(imagesSrc = []) {
    for (var i = 0; i < imagesSrc.length; i++) {
        (new Image()).src = imagesSrc[i];
    }
}

//-- usage --//
preloadImages([
    "images/icons/good.png",
    "images/icons/headSlanted.png",
    "images/icons/headTurned.png",
    "images/icons/headLowered.png",
    "images/icons/shouldersSlanted.png",
])