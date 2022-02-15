let timeInMinutes = 0;

function getHours(){
    return Math.floor(timeInMinutes / 60);
}

function getMinutes(){
    return Math.floor(timeInMinutes) % 60;
}

function updateClock(){
    let h = getHours();
    let m = getMinutes();
    if(h != 0 && m != 0){
        $("#clock").innerText = `${h} hr ${m} min working`
    }else if(h != 0 && m == 0){
        $("#clock").innerText = `${h} hr working`
    }else if(h == 0 && m != 0){
        $("#clock").innerText = `${m} min working`
    }else if(h == 0 && m == 0){
        $("#clock").innerText = `${0} min working`
    }
}