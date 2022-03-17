if (!localStorage.getItem('settings')) {
    let template = JSON.stringify({
        voiceAssistant: true,
        drawPoints: true,
        programWorking: true,
    });
    localStorage.setItem('settings', template);
}
const settings = JSON.parse(localStorage.getItem('settings'));

Object.entries(settings).forEach(([setting, value]) => {
    document.querySelector(`#cb-${setting}`).checked = value;
})

document.querySelectorAll("input[type=checkbox]").forEach(el => {
    const setting = el.id.slice(3);

    el.addEventListener('change', (event) => {
        settings[setting] = event.target.checked;
        localStorage.setItem('settings', JSON.stringify(settings));
    })
});

function clearData() {
    let reply = "delete"; // prompt("Type \"delete\" to confirm")
    if (reply == "delete") localStorage.clear()
}