async function setupWebcam(videoEl) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user', // 'user' or 'environment'
            },
        })
        if ('srcObject' in videoEl) {
            videoEl.srcObject = webcamStream
        } else {
            videoEl.src = window.URL.createObjectURL(webcamStream)
        }
        return new Promise((resolve, _) => {
            videoEl.onloadedmetadata = () => {
                const imgWidth = videoEl.clientWidth
                const imgHeight = videoEl.clientHeight

                const detection = document.getElementById('detection')
                const ctx = detection.getContext('2d')

                function resizeCanvas() {
                    detection.width = videoEl.clientWidth;
                    detection.height = videoEl.clientHeight;
                }
                resizeCanvas()
                new ResizeObserver(resizeCanvas).observe(videoEl);


                resolve([ctx, imgHeight, imgWidth])
            }
        })
    } else {
        alert('Нет вебкамеры - извините!')
    }
}